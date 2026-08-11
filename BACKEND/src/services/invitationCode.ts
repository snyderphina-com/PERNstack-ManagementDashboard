import { createHash, randomBytes } from "node:crypto";

/**
 * Generates a cryptographically secure admin invitation code.
 *
 * Format: ADM-XXXX-XXXX-XXXX
 * where X is an uppercase alphanumeric character (A-Z, 0-9)
 * excluding visually ambiguous chars (0, O, I, 1, L)
 *
 * Entropy: ~56 bits — sufficient for a short-lived single-use code
 * that is also validated server-side.
 */
const SAFE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    const byte = bytes[i];

    if (byte === undefined) {
      throw new Error("Failed to generate secure random segment");
    }

    const char = SAFE_CHARS[byte % SAFE_CHARS.length];

    if (char === undefined) {
      throw new Error("Failed to select random character");
    }

    result += char;
  }

  return result;
}

/**
 * Returns a new plaintext invitation code.
 * Example: ADM-7KX9-PQ4M-82ZT
 */
export function generateInvitationCode(): string {
  return [
    "ADM",
    randomSegment(4),
    randomSegment(4),
    randomSegment(4),
  ].join("-");
}

/**
 * Hashes a plaintext invitation code with SHA-256.
 * The hash is what gets stored in the database.
 */
export function hashInvitationCode(plaintext: string): string {
  return createHash("sha256")
    .update(plaintext.trim().toUpperCase())
    .digest("hex");
}

/**
 * Normalises a code submitted by a user before hashing.
 * Strips whitespace, uppercases — makes the comparison robust.
 */
export function normaliseCode(raw: string): string {
  return raw.trim().toUpperCase();
}