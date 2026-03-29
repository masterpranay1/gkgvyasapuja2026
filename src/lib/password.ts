import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_LEN = 16;
const KEY_LEN = 32;

export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_LEN);
  const hash = scryptSync(plain, salt, KEY_LEN);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1]!, "base64");
  const expected = Buffer.from(parts[2]!, "base64");
  if (salt.length !== SALT_LEN || expected.length !== KEY_LEN) return false;
  const hash = scryptSync(plain, salt, KEY_LEN);
  return timingSafeEqual(hash, expected);
}

const LOGIN_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateMaintainerLoginId(): string {
  const bytes = randomBytes(12);
  let suffix = "";
  for (let i = 0; i < 10; i++) {
    suffix += LOGIN_CHARS[bytes[i]! % LOGIN_CHARS.length]!;
  }
  return `mtr_${suffix}`;
}

export function generateMaintainerPassword(length = 16): string {
  const bytes = randomBytes(length);
  let s = "";
  for (let i = 0; i < length; i++) {
    s += LOGIN_CHARS[bytes[i]! % LOGIN_CHARS.length]!;
  }
  return s;
}
