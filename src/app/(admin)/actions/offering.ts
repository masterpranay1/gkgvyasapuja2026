"use server";

import { db } from "@/db";
import {
  countries,
  states,
  cities,
  temples,
  users,
  offerings,
  offeringEditLogs,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
const mammoth = require("mammoth");

export async function getCountries() {
  try {
    const data = await db.select().from(countries).orderBy(countries.name);
    return data;
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    return [];
  }
}

export async function getStates(countryId: string) {
  try {
    const data = await db
      .select()
      .from(states)
      .where(eq(states.countryId, countryId))
      .orderBy(states.name);
    return data;
  } catch (error) {
    console.error("Failed to fetch states:", error);
    return [];
  }
}

export async function getCities(stateId: string) {
  try {
    const data = await db
      .select()
      .from(cities)
      .where(eq(cities.stateId, stateId))
      .orderBy(cities.name);
    return data;
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    return [];
  }
}

export async function getTemplesByStateId(stateId: string) {
  try {
    const data = await db
      .select()
      .from(temples)
      .where(eq(temples.stateId, stateId))
      .orderBy(temples.name);
    return data;
  } catch (error) {
    console.error("Failed to fetch temples:", error);
    return [];
  }
}

/** Profile fields returned when an email already exists (for prefill). */
export type ExistingUserProfile = {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  email: string;
  phone: string;
  countryId: string;
  stateId: string;
  cityId: string;
  templeId: string;
  initiated: boolean;
  initiationType: string;
  initiationYear: string;
  initiatedName: string;
};

export async function checkUserByEmail(
  email: string,
): Promise<
  | { exists: false; error?: string }
  | { exists: true; user: ExistingUserProfile }
> {
  try {
    const trimmed = email.trim();
    if (!trimmed) {
      return { exists: false };
    }
    const [row] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${trimmed.toLowerCase()}`)
      .limit(1);
    if (!row) {
      return { exists: false };
    }
    return {
      exists: true,
      user: {
        firstName: row.firstName,
        lastName: row.lastName,
        gender: row.gender,
        email: row.email,
        phone: row.phone,
        countryId: row.countryId,
        stateId: row.stateId,
        cityId: row.cityId,
        templeId: row.templeId,
        initiated: row.initiated,
        initiationType: row.initiationType,
        initiationYear: row.initiationYear,
        initiatedName: row.initiatedName,
      },
    };
  } catch (error) {
    console.error("checkUserByEmail:", error);
    return { exists: false, error: "Could not verify email. Try again." };
  }
}

export async function submitOffering(formData: any) {
  try {
    const year = new Date().getFullYear().toString();
    const emailNorm = formData.email.trim().toLowerCase();

    const [existingUser] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${emailNorm}`)
      .limit(1);

    const userValues = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      email: formData.email.trim(),
      phone: formData.phone,
      countryId: formData.countryId,
      stateId: formData.stateId,
      cityId: formData.cityId,
      templeId: formData.templeId,
      initiated: formData.initiated === "true" || formData.initiated === true,
      initiationType: formData.initiationType || "",
      initiationYear: formData.initiationYear || "",
      initiatedName: formData.initiatedName || "",
      updatedAt: new Date(),
    };

    let userId: string;

    if (existingUser) {
      await db
        .update(users)
        .set(userValues)
        .where(eq(users.id, existingUser.id));
      userId = existingUser.id;
    } else {
      const [created] = await db
        .insert(users)
        .values(userValues)
        .returning();
      if (!created) {
        return { success: false, error: "Failed to create user record." };
      }
      userId = created.id;
    }

    const [existingOffering] = await db
      .select()
      .from(offerings)
      .where(and(eq(offerings.userId, userId), eq(offerings.year, year)))
      .limit(1);

    if (existingOffering) {
      await db
        .delete(offeringEditLogs)
        .where(eq(offeringEditLogs.offeringId, existingOffering.id));

      await db
        .update(offerings)
        .set({
          offering: formData.offeringText,
          language: formData.language || "English",
          updatedAt: new Date(),
          lastEditedAt: null,
          lastEditedByRole: null,
          lastEditedByMaintainerId: null,
        })
        .where(eq(offerings.id, existingOffering.id));
    } else {
      await db.insert(offerings).values({
        userId,
        year,
        offering: formData.offeringText,
        language: formData.language || "English",
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit offering:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function parseDocx(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.convertToHtml(
      { buffer },
      { ignoreEmptyParagraphs: false },
    );
    return { success: true, text: result.value };
  } catch (error) {
    console.error("Failed to parse docx:", error);
    return {
      success: false,
      error:
        "Failed to read the document. Please make sure it is a valid .docx file.",
    };
  }
}
