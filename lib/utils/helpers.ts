import bcryptjs from "bcryptjs";

/**
 * Hash a password with bcryptjs
 * NEVER store plaintext passwords
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(12); // 12 rounds recommended for production
  return bcryptjs.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Generate a cryptographically secure random string (e.g., for session tokens)
 */
export function generateRandomString(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = chars.length;
  let result = "";
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % charsLength];
  }

  return result;
}

/**
 * Check if a user is an admin (server-side only)
 * ALWAYS check this server-side, never rely on client-side checks
 */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(
  xForwardedFor?: string | null,
  remoteAddr?: string | null
): string {
  // Prefer x-forwarded-for (set by proxies), fallback to remote address
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return ips[0].trim();
  }
  return remoteAddr || "unknown";
}

/**
 * Mask email for display (e.g., "u***@example.com")
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  const masked =
    localPart.charAt(0) + "*".repeat(Math.max(1, localPart.length - 2)) + localPart.charAt(localPart.length - 1);
  return `${masked}@${domain}`;
}

/**
 * Validate if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Check if a date has expired
 */
export function isExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() <= Date.now();
}

/**
 * Create a generic API response
 */
export function apiResponse<T>(
  data: T,
  statusCode: number = 200
): { data: T; status: number } {
  return { data, status: statusCode };
}

/**
 * Create a generic error response
 */
export function apiError(
  message: string,
  statusCode: number = 400
): { error: string; status: number } {
  return { error: message, status: statusCode };
}
