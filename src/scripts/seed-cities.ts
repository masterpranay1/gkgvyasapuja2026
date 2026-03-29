import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env") });

type JsonCity = {
  id: string;
  name: string;
  state_id: string;
  state_code?: string;
  state_name: string;
  country_id: string;
  country_code?: string;
  country_name: string;
};

function stateLookupKey(countryName: string, stateName: string) {
  return `${countryName}\n${stateName}`;
}

function extractCitiesFromExport(raw: string): JsonCity[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Expected cities export to be a JSON array");
  }

  const table = parsed.find(
    (x): x is { type: string; name: string; data: JsonCity[] } =>
      typeof x === "object" &&
      x !== null &&
      "type" in x &&
      (x as { type: string }).type === "table" &&
      "name" in x &&
      (x as { name: string }).name === "cities" &&
      "data" in x &&
      Array.isArray((x as { data: unknown }).data),
  );

  if (table) {
    return table.data;
  }

  if (
    parsed.length > 0 &&
    typeof parsed[0] === "object" &&
    parsed[0] !== null &&
    "state_name" in parsed[0] &&
    "name" in parsed[0] &&
    !("type" in parsed[0])
  ) {
    return parsed as JsonCity[];
  }

  throw new Error(
    'Could not find cities rows: expected phpMyAdmin export with type "table" and name "cities", or a flat array of city objects.',
  );
}

const CHUNK = 500;

async function main() {
  const jsonPath =
    process.argv[2] ?? resolve(process.env.HOME ?? "", "Downloads/cities.json");

  const rows = extractCitiesFromExport(readFileSync(jsonPath, "utf-8"));

  const { db, pool } = await import("../db/index");
  const { countries, states, cities } = await import("../db/schema");

  const stateRows = await db
    .select({
      stateId: states.id,
      stateName: states.name,
      countryName: countries.name,
    })
    .from(states)
    .innerJoin(countries, eq(states.countryId, countries.id));

  const idsByKey = new Map<string, Set<string>>();
  for (const r of stateRows) {
    const key = stateLookupKey(r.countryName, r.stateName);
    if (!idsByKey.has(key)) idsByKey.set(key, new Set());
    idsByKey.get(key)!.add(r.stateId);
  }

  const stateIdByKey = new Map<string, string>();
  let duplicateStateKeys = 0;
  for (const [key, ids] of idsByKey) {
    const sorted = [...ids].sort();
    stateIdByKey.set(key, sorted[0]!);
    if (sorted.length > 1) duplicateStateKeys += 1;
  }

  if (duplicateStateKeys > 0) {
    console.warn(
      `Warning: ${duplicateStateKeys} (country, state) key(s) map to multiple rows in "state" (e.g. seed run twice). Using one UUID per key (lexicographically smallest).`,
    );
  }

  const missingStates = new Set<string>();
  const values: { name: string; stateId: string }[] = [];

  for (const c of rows) {
    const key = stateLookupKey(c.country_name, c.state_name);
    const stateId = stateIdByKey.get(key);
    if (!stateId) {
      missingStates.add(key.replace("\n", " / "));
      continue;
    }
    values.push({ name: c.name, stateId });
  }

  if (missingStates.size > 0) {
    const list = [...missingStates].sort();
    console.error(
      `${missingStates.size} (country, state) pair(s) from cities.json have no matching row in "state". Examples: ${list.slice(0, 15).join("; ")}${list.length > 15 ? " …" : ""}`,
    );
    process.exit(1);
  }

  for (let i = 0; i < values.length; i += CHUNK) {
    await db.insert(cities).values(values.slice(i, i + CHUNK));
  }

  console.log(`Inserted ${values.length} cities from ${jsonPath}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
