import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

type JsonState = {
  id: string;
  name: string;
  country_id: string;
  country_code?: string;
  country_name: string;
  state_code?: string;
  type?: string;
  latitude?: string;
  longitude?: string;
};

const CHUNK = 200;

async function main() {
  const jsonPath =
    process.argv[2] ?? resolve(process.env.HOME ?? "", "Downloads/states.json");

  const raw = readFileSync(jsonPath, "utf-8");
  const rows: JsonState[] = JSON.parse(raw);

  const { db, pool } = await import("../db/index");
  const { countries, states } = await import("../db/schema");

  const countryRows = await db
    .select({ id: countries.id, name: countries.name })
    .from(countries);

  const nameToId = new Map<string, string>();
  for (const c of countryRows) {
    nameToId.set(c.name, c.id);
  }

  const missing = new Set<string>();
  const values: { name: string; countryId: string }[] = [];

  for (const s of rows) {
    const countryId = nameToId.get(s.country_name);
    if (!countryId) {
      missing.add(s.country_name);
      continue;
    }
    values.push({ name: s.name, countryId });
  }

  if (missing.size > 0) {
    const list = [...missing].sort();
    console.error(
      `${missing.size} country name(s) from states.json have no matching row in "country". Examples: ${list.slice(0, 15).join("; ")}${list.length > 15 ? " …" : ""}`,
    );
    process.exit(1);
  }

  for (let i = 0; i < values.length; i += CHUNK) {
    await db.insert(states).values(values.slice(i, i + CHUNK));
  }

  console.log(`Inserted ${values.length} states from ${jsonPath}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
