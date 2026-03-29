"use server";

import { db } from "@/db";
import { maintainers } from "@/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  generateMaintainerLoginId,
  generateMaintainerPassword,
  hashPassword,
  verifyPassword,
} from "@/lib/password";

async function requireAdminForMaintainerActions() {
  if (!(await getAdminSession())) {
    redirect("/admin");
  }
}

export async function getMaintainersList() {
  await requireAdminForMaintainerActions();
  return db
    .select({
      id: maintainers.id,
      loginId: maintainers.loginId,
      label: maintainers.label,
      createdAt: maintainers.createdAt,
    })
    .from(maintainers)
    .orderBy(desc(maintainers.createdAt));
}

export async function createMaintainer(
  _prevState: unknown,
  formData: FormData,
) {
  await requireAdminForMaintainerActions();

  const labelRaw = formData.get("label");
  const label =
    typeof labelRaw === "string" && labelRaw.trim().length > 0
      ? labelRaw.trim()
      : null;

  let loginId = "";
  let password = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    loginId = generateMaintainerLoginId();
    password = generateMaintainerPassword(16);
    const passwordHash = hashPassword(password);
    try {
      await db.insert(maintainers).values({
        loginId,
        passwordHash,
        label,
      });
      revalidatePath("/admin-dashboard/maintainers");
      return {
        success: true as const,
        loginId,
        password,
      };
    } catch {
      continue;
    }
  }
  return {
    success: false as const,
    error: "Could not generate a unique login id. Try again.",
  };
}

export async function updateMaintainer(
  _prevState: unknown,
  formData: FormData,
) {
  await requireAdminForMaintainerActions();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { success: false as const, error: "Missing maintainer id." };
  }

  const labelRaw = formData.get("label");
  const label =
    typeof labelRaw === "string" && labelRaw.trim().length > 0
      ? labelRaw.trim()
      : null;

  const regenerate =
    formData.get("regeneratePassword") === "true" ||
    formData.get("regeneratePassword") === "on";

  if (regenerate) {
    const password = generateMaintainerPassword(16);
    const passwordHash = hashPassword(password);
    await db
      .update(maintainers)
      .set({
        label,
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(maintainers.id, id));
    revalidatePath("/admin-dashboard/maintainers");
    return { success: true as const, newPassword: password };
  }

  await db
    .update(maintainers)
    .set({
      label,
      updatedAt: new Date(),
    })
    .where(eq(maintainers.id, id));
  revalidatePath("/admin-dashboard/maintainers");
  return { success: true as const };
}

export async function deleteMaintainer(id: string) {
  await requireAdminForMaintainerActions();
  try {
    await db.delete(maintainers).where(eq(maintainers.id, id));
    revalidatePath("/admin-dashboard/maintainers");
    return { success: true as const };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not delete.";
    return { success: false as const, error: message };
  }
}

export async function loginMaintainer(prevState: unknown, formData: FormData) {
  const loginId = formData.get("loginId");
  const password = formData.get("password");

  if (typeof loginId !== "string" || typeof password !== "string") {
    return { error: "Invalid credentials" };
  }

  const rows = await db
    .select()
    .from(maintainers)
    .where(eq(maintainers.loginId, loginId.trim()))
    .limit(1);

  const row = rows[0];
  if (!row || !verifyPassword(password, row.passwordHash)) {
    return { error: "Invalid credentials" };
  }

  const cookieStore = await cookies();
  cookieStore.set("maintainer_session", row.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  redirect("/maintainer-dashboard/offerings");
}

export async function logoutMaintainer() {
  const c = await cookies();
  c.delete("maintainer_session");
  redirect("/maintainer");
}
