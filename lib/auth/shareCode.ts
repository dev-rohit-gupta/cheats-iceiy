import { randomBytes } from "crypto";

/**
 * Generate a cryptographically secure random share code
 * Format: 6 uppercase alphanumeric characters (e.g., "ABCD12")
 */
export function generateShareCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomIndices = randomBytes(length);
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[randomIndices[i] % chars.length];
  }

  return code;
}

/**
 * Validate share code format
 */
export function isValidShareCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}
