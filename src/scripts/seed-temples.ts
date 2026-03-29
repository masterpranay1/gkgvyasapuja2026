import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env") });

type JsonTemple = {
  Id: string;
  TempleName: string;
  StateId: string;
  Status?: string;
};

type JsonStateRow = {
  id: string;
  name: string;
  country_name: string;
};

function stateLookupKey(countryName: string, stateName: string) {
  return `${countryName}\n${stateName}`;
}

function normalizeTempleLabel(name: string) {
  return name.replace(/^ISKCON\s+/i, "").trim();
}

function pickCityIdForTemple(
  templeName: string,
  citiesInState: { id: string; name: string }[],
  defaultCityId: string,
): string {
  if (citiesInState.length === 0) return defaultCityId;

  const normalized = normalizeTempleLabel(templeName).toLowerCase();
  const firstToken = normalized.split(/[\s(,]+/).filter(Boolean)[0] ?? "";

  for (const c of citiesInState) {
    const cn = c.name.toLowerCase();
    if (cn === normalized) return c.id;
  }
  for (const c of citiesInState) {
    const cn = c.name.toLowerCase();
    if (normalized.includes(cn) || cn.includes(normalized)) return c.id;
  }
  if (firstToken) {
    for (const c of citiesInState) {
      if (c.name.toLowerCase() === firstToken) return c.id;
    }
  }
  return defaultCityId;
}

const CHUNK = 100;

async function main() {
  const templesPath =
    process.argv[2] ?? resolve(process.env.HOME ?? "", "Downloads/temples.json");
  const statesJsonPath =
    process.argv[3] ?? resolve(process.env.HOME ?? "", "Downloads/states.json");

  const templeRows: JsonTemple[] = JSON.parse(readFileSync(templesPath, "utf-8"));
  const stateRowsFromFile: JsonStateRow[] = JSON.parse(
    readFileSync(statesJsonPath, "utf-8"),
  );

  const legacyStateToKey = new Map<string, string>();
  for (const s of stateRowsFromFile) {
    legacyStateToKey.set(
      s.id,
      stateLookupKey(s.country_name, s.name),
    );
  }

  const { db, pool } = await import("../db/index");
  const { countries, states, cities, temples } = await import("../db/schema");

  const stateJoinRows = await db
    .select({
      stateId: states.id,
      stateName: states.name,
      countryName: countries.name,
    })
    .from(states)
    .innerJoin(countries, eq(states.countryId, countries.id));

  const idsByKey = new Map<string, Set<string>>();
  for (const r of stateJoinRows) {
    const key = stateLookupKey(r.countryName, r.stateName);
    if (!idsByKey.has(key)) idsByKey.set(key, new Set());
    idsByKey.get(key)!.add(r.stateId);
  }

  const stateUuidByKey = new Map<string, string>();
  let duplicateStateKeys = 0;
  for (const [key, ids] of idsByKey) {
    const sorted = [...ids].sort();
    stateUuidByKey.set(key, sorted[0]!);
    if (sorted.length > 1) duplicateStateKeys += 1;
  }

  if (duplicateStateKeys > 0) {
    console.warn(
      `Warning: ${duplicateStateKeys} (country, state) key(s) have multiple "state" rows; using lexicographically smallest UUID per key.`,
    );
  }

  const cityRows = await db
    .select({ id: cities.id, name: cities.name, stateId: cities.stateId })
    .from(cities);

  const citiesByState = new Map<string, { id: string; name: string }[]>();
  for (const c of cityRows) {
    if (!citiesByState.has(c.stateId)) citiesByState.set(c.stateId, []);
    citiesByState.get(c.stateId)!.push({ id: c.id, name: c.name });
  }
  for (const list of citiesByState.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const defaultCityByState = new Map<string, string>();
  for (const [sid, list] of citiesByState) {
    if (list[0]) defaultCityByState.set(sid, list[0].id);
  }

  const stateIdToName = new Map<string, string>();
  for (const r of stateJoinRows) {
    if (!stateIdToName.has(r.stateId)) {
      stateIdToName.set(r.stateId, r.stateName);
    }
  }

  const templeStateIds = new Set<string>();
  for (const t of templeRows) {
    if (t.Status != null && t.Status !== "1") continue;
    const k = legacyStateToKey.get(t.StateId);
    if (!k) continue;
    const su = stateUuidByKey.get(k);
    if (su) templeStateIds.add(su);
  }

  let placeholderCities = 0;
  for (const sid of templeStateIds) {
    const existing = citiesByState.get(sid);
    if (existing && existing.length > 0) continue;

    const label = (stateIdToName.get(sid) ?? "Other").slice(0, 255);
    const [row] = await db
      .insert(cities)
      .values({ name: label, stateId: sid })
      .returning({ id: cities.id });
    if (!row) continue;
    citiesByState.set(sid, [{ id: row.id, name: label }]);
    defaultCityByState.set(sid, row.id);
    placeholderCities += 1;
  }

  if (placeholderCities > 0) {
    console.warn(
      `Created ${placeholderCities} placeholder city row(s) for states with no cities in the DB (temples need a city_id).`,
    );
  }

  const values: { name: string; cityId: string; stateId: string }[] = [];
  const unknownLegacyIds = new Set<string>();
  const missingStates: string[] = [];
  const missingDefaultCity: string[] = [];

  for (const t of templeRows) {
    if (t.Status != null && t.Status !== "1") continue;

    const key = legacyStateToKey.get(t.StateId);
    if (!key) {
      unknownLegacyIds.add(t.StateId);
      missingStates.push(`${t.TempleName} (StateId=${t.StateId}, not in states.json)`);
      continue;
    }

    const stateUuid = stateUuidByKey.get(key);
    if (!stateUuid) {
      unknownLegacyIds.add(t.StateId);
      missingStates.push(`${t.TempleName} (StateId=${t.StateId}, no DB state for ${key.replace("\n", " / ")})`);
      continue;
    }

    const list = citiesByState.get(stateUuid) ?? [];
    if (!defaultCityByState.has(stateUuid)) {
      missingDefaultCity.push(`${t.TempleName} (state has no cities)`);
      continue;
    }
    const defaultCityId = defaultCityByState.get(stateUuid)!;
    const cityId = pickCityIdForTemple(t.TempleName, list, defaultCityId);

    const name = t.TempleName.slice(0, 255);
    values.push({ name, cityId, stateId: stateUuid });
  }

  if (unknownLegacyIds.size > 0) {
    console.error(
      `No matching DB state for ${unknownLegacyIds.size} legacy StateId value(s) from ${statesJsonPath}. Examples: ${[...unknownLegacyIds].slice(0, 12).join(", ")}`,
    );
    console.error("Example rows:", missingStates.slice(0, 5).join("; "));
    process.exit(1);
  }

  if (missingDefaultCity.length > 0) {
    console.error(missingDefaultCity.join("\n"));
    process.exit(1);
  }

  for (let i = 0; i < values.length; i += CHUNK) {
    await db.insert(temples).values(values.slice(i, i + CHUNK));
  }

  console.log(`Inserted ${values.length} temples from ${templesPath}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
