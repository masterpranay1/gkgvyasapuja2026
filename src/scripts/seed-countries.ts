import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

type JsonCountry = {
  id: string;
  name: string;
  numeric_code?: string;
  phonecode?: string;
  currency?: string;
  currency_name?: string;
  currency_symbol?: string;
  nationality?: string;
};

const CHUNK = 200;

async function main() {
  const jsonPath =
    process.argv[2] ?? resolve(process.env.HOME ?? "", "Downloads/countries.json");

  const raw = readFileSync(jsonPath, "utf-8");
  const rows: JsonCountry[] = JSON.parse(raw);

  const { db, pool } = await import("../db/index");
  const { countries } = await import("../db/schema");

  const values = rows.map((c) => ({
    name: c.name,
    numericCode: c.numeric_code ?? null,
    phoneCode: c.phonecode ?? null,
    currencyCode: c.currency ?? null,
    CurrencyName: c.currency_name ?? null,
    CurrencySymbol: c.currency_symbol ?? null,
    nationality: c.nationality?.trim() || null,
  }));

  for (let i = 0; i < values.length; i += CHUNK) {
    const chunk = values.slice(i, i + CHUNK);
    await db.insert(countries).values(chunk);
  }

  console.log(`Inserted ${values.length} countries from ${jsonPath}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
