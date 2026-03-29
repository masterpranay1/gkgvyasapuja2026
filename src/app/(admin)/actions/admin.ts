"use server";

import { assertCanManageOfferings } from "@/lib/auth";
import { db } from "@/db";
import {
  countries,
  states,
  cities,
  temples,
  books,
  offerings,
  users,
} from "@/db/schema";
import { eq, desc, and, asc, count, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Country Actions ---

export async function getCountries() {
  return db.select().from(countries).orderBy(desc(countries.createdAt));
}

const DEFAULT_COUNTRIES_PAGE_SIZE = 20;
const MAX_COUNTRIES_PAGE_SIZE = 100;

export async function getCountriesPaginated(options?: {
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(
    Math.max(options?.pageSize ?? DEFAULT_COUNTRIES_PAGE_SIZE, 1),
    MAX_COUNTRIES_PAGE_SIZE,
  );
  const page = Math.max(options?.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const items = await db
    .select()
    .from(countries)
    .orderBy(desc(countries.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countRows = await db.select({ total: count() }).from(countries);
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

const SEARCH_LIMIT = 25;

function sanitizeIlikePattern(q: string) {
  return q.replace(/[%_\\]/g, "").trim();
}

export async function searchCountries(query: string) {
  const safe = sanitizeIlikePattern(query);
  if (safe.length === 0) return [];
  const pattern = `%${safe}%`;
  return db
    .select({ id: countries.id, name: countries.name })
    .from(countries)
    .where(ilike(countries.name, pattern))
    .orderBy(asc(countries.name))
    .limit(SEARCH_LIMIT);
}

export async function getCountryById(id: string) {
  const rows = await db
    .select({ id: countries.id, name: countries.name })
    .from(countries)
    .where(eq(countries.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function searchStates(
  query: string,
  options?: { countryId?: string },
) {
  const safe = sanitizeIlikePattern(query);
  if (safe.length === 0) return [];
  const pattern = `%${safe}%`;
  const nameMatch = ilike(states.name, pattern);
  const whereExpr = options?.countryId
    ? and(nameMatch, eq(states.countryId, options.countryId))
    : nameMatch;
  return db
    .select({ id: states.id, name: states.name })
    .from(states)
    .where(whereExpr)
    .orderBy(asc(states.name))
    .limit(SEARCH_LIMIT);
}

export async function getStateById(id: string) {
  const rows = await db
    .select({ id: states.id, name: states.name })
    .from(states)
    .where(eq(states.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function addCountry(data: typeof countries.$inferInsert) {
  try {
    await db.insert(countries).values(data);
    revalidatePath("/admin-dashboard/countries");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCountry(id: string) {
  try {
    await db.delete(countries).where(eq(countries.id, id));
    revalidatePath("/admin-dashboard/countries");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- State Actions ---

export async function getStates() {
  // We want to fetch states along with their country mapping maybe, but simple get is fine for now
  return db.select().from(states);
}

const DEFAULT_STATES_PAGE_SIZE = 20;
const MAX_STATES_PAGE_SIZE = 100;

export async function getStatesPaginated(options?: {
  countryId?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(
    Math.max(options?.pageSize ?? DEFAULT_STATES_PAGE_SIZE, 1),
    MAX_STATES_PAGE_SIZE,
  );
  const page = Math.max(options?.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const baseList = db.select().from(states);
  const listQuery = options?.countryId
    ? baseList.where(eq(states.countryId, options.countryId))
    : baseList;
  const items = await listQuery
    .orderBy(asc(states.name))
    .limit(pageSize)
    .offset(offset);

  const baseCount = db.select({ total: count() }).from(states);
  const countQuery = options?.countryId
    ? baseCount.where(eq(states.countryId, options.countryId))
    : baseCount;
  const countRows = await countQuery;
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function addState(data: typeof states.$inferInsert) {
  try {
    await db.insert(states).values(data);
    revalidatePath("/admin-dashboard/states");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteState(id: string) {
  try {
    await db.delete(states).where(eq(states.id, id));
    revalidatePath("/admin-dashboard/states");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- City Actions ---

export async function getCities() {
  return db.select().from(cities);
}

const DEFAULT_CITIES_PAGE_SIZE = 20;
const MAX_CITIES_PAGE_SIZE = 100;

export async function getCitiesPaginated(options?: {
  countryId?: string;
  stateId?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(
    Math.max(options?.pageSize ?? DEFAULT_CITIES_PAGE_SIZE, 1),
    MAX_CITIES_PAGE_SIZE,
  );
  const page = Math.max(options?.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (options?.countryId) {
    conditions.push(eq(states.countryId, options.countryId));
  }
  if (options?.stateId) {
    conditions.push(eq(cities.stateId, options.stateId));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const joinBase = db
    .select({
      id: cities.id,
      name: cities.name,
      stateId: cities.stateId,
      stateName: states.name,
    })
    .from(cities)
    .innerJoin(states, eq(cities.stateId, states.id));

  const listQuery = whereClause ? joinBase.where(whereClause) : joinBase;
  const items = await listQuery
    .orderBy(asc(cities.name))
    .limit(pageSize)
    .offset(offset);

  const countJoin = db
    .select({ total: count() })
    .from(cities)
    .innerJoin(states, eq(cities.stateId, states.id));
  const countQuery = whereClause ? countJoin.where(whereClause) : countJoin;
  const countRows = await countQuery;
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function addCity(data: typeof cities.$inferInsert) {
  try {
    await db.insert(cities).values(data);
    revalidatePath("/admin-dashboard/cities");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Temple Actions ---

export async function getTemples() {
  return db.select().from(temples);
}

const DEFAULT_TEMPLES_PAGE_SIZE = 20;
const MAX_TEMPLES_PAGE_SIZE = 100;

export async function getTemplesPaginated(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const pageSize = Math.min(
    Math.max(options?.pageSize ?? DEFAULT_TEMPLES_PAGE_SIZE, 1),
    MAX_TEMPLES_PAGE_SIZE,
  );
  const page = Math.max(options?.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const safe = sanitizeIlikePattern(options?.search ?? "");
  const searchMatch =
    safe.length > 0
      ? or(
          ilike(temples.name, `%${safe}%`),
          ilike(cities.name, `%${safe}%`),
          ilike(states.name, `%${safe}%`),
        )
      : undefined;

  const joinBase = db
    .select({
      id: temples.id,
      name: temples.name,
      cityId: temples.cityId,
      stateId: temples.stateId,
      cityName: cities.name,
      stateName: states.name,
    })
    .from(temples)
    .innerJoin(cities, eq(temples.cityId, cities.id))
    .innerJoin(states, eq(temples.stateId, states.id));

  const listQuery = searchMatch ? joinBase.where(searchMatch) : joinBase;

  const items = await listQuery
    .orderBy(asc(temples.name))
    .limit(pageSize)
    .offset(offset);

  const countJoin = db
    .select({ total: count() })
    .from(temples)
    .innerJoin(cities, eq(temples.cityId, cities.id))
    .innerJoin(states, eq(temples.stateId, states.id));
  const countQuery = searchMatch ? countJoin.where(searchMatch) : countJoin;
  const countRows = await countQuery;
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function addTemple(data: typeof temples.$inferInsert) {
  try {
    await db.insert(temples).values(data);
    revalidatePath("/admin-dashboard/temples");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTemple(id: string) {
  try {
    await db.delete(temples).where(eq(temples.id, id));
    revalidatePath("/admin-dashboard/temples");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Book Actions ---

export async function getBooks() {
  return db.select().from(books).orderBy(desc(books.createdAt));
}

export async function addBook(data: typeof books.$inferInsert) {
  try {
    await db.insert(books).values({
      ...data,
      downloadCount: data.downloadCount ?? 0,
      viewCount: data.viewCount ?? 0,
    });
    revalidatePath("/admin-dashboard/books");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Offerings Actions ---

export async function getAdminOfferings(filters?: {
  countryId?: string;
  stateId?: string;
  cityId?: string;
  templeId?: string;
  language?: string;
}) {
  await assertCanManageOfferings();

  const conditions = [];

  if (filters?.countryId) {
    conditions.push(eq(users.countryId, filters.countryId));
  }
  if (filters?.stateId) {
    conditions.push(eq(users.stateId, filters.stateId));
  }
  if (filters?.cityId) {
    conditions.push(eq(users.cityId, filters.cityId));
  }
  if (filters?.templeId) {
    conditions.push(eq(users.templeId, filters.templeId));
  }
  if (filters?.language) {
    conditions.push(eq(offerings.language, filters.language as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select({
      id: offerings.id,
      year: offerings.year,
      offering: offerings.offering,
      language: offerings.language,
      createdAt: offerings.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        initiatedName: users.initiatedName,
        countryId: users.countryId,
        stateId: users.stateId,
        cityId: users.cityId,
        templeId: users.templeId,
      },
    })
    .from(offerings)
    .innerJoin(users, eq(offerings.userId, users.id))
    .where(whereClause)
    .orderBy(desc(offerings.createdAt));
}

export async function editOffering(
  id: string,
  data: { offering: string; language: "Hindi" | "English" },
) {
  await assertCanManageOfferings();

  try {
    await db
      .update(offerings)
      .set({
        offering: data.offering,
        language: data.language,
        updatedAt: new Date(),
      })
      .where(eq(offerings.id, id));

    revalidatePath("/admin-dashboard/offerings");
    revalidatePath("/maintainer-dashboard/offerings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
