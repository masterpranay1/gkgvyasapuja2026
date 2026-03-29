import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

type JsonBook = {
  Id: string;
  Title: string;
  Thumbnail: string;
  ViewUrl: string;
  DownloadUrl: string;
  YearId: string;
  Status?: string;
  DownloadCount?: string;
};

const L = 255;

function trunc(s: string) {
  return s.slice(0, L);
}

function extractBooksFromExport(raw: string): JsonBook[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Expected books export to be a JSON array");
  }

  const table = parsed.find(
    (x): x is { type: string; name: string; data: JsonBook[] } =>
      typeof x === "object" &&
      x !== null &&
      "type" in x &&
      (x as { type: string }).type === "table" &&
      "name" in x &&
      (x as { name: string }).name === "books" &&
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
    "Title" in parsed[0] &&
    !("type" in parsed[0])
  ) {
    return parsed as JsonBook[];
  }

  throw new Error(
    'Could not find books rows: expected phpMyAdmin export with type "table" and name "books", or a flat array.',
  );
}

const CHUNK = 50;

async function main() {
  const jsonPath =
    process.argv[2] ?? resolve(process.env.HOME ?? "", "Downloads/books.json");

  const rows = extractBooksFromExport(readFileSync(jsonPath, "utf-8"));

  const { db, pool } = await import("../db/index");
  const { books } = await import("../db/schema");

  const values = rows
    .filter((b) => b.Status == null || b.Status === "1")
    .map((b) => {
      const downloads = Number.parseInt(b.DownloadCount ?? "0", 10);
      return {
        title: trunc(b.Title),
        thumbnail: trunc(b.Thumbnail),
        viewUrl: trunc(b.ViewUrl),
        downloadUrl: trunc(b.DownloadUrl),
        publishedYear: trunc(b.YearId),
        downloadCount: Number.isFinite(downloads) ? downloads : 0,
        viewCount: 0,
      };
    });

  for (let i = 0; i < values.length; i += CHUNK) {
    await db.insert(books).values(values.slice(i, i + CHUNK));
  }

  console.log(`Inserted ${values.length} books from ${jsonPath}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
