/**
 * Environment variable validation helper
 * Validates all required environment variables at startup
 */

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

export function validateEnvVars(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Please check your .env.local file`
    );
  }

  console.log("✅ All required environment variables are set");
}

/**
 * Get optional environment variables with defaults
 */
export function getEnvVar(
  name: string,
  defaultValue?: string
): string | undefined {
  return process.env[name] || defaultValue;
}

/**
 * Parse numeric environment variables
 */
export function getEnvNumber(
  name: string,
  defaultValue?: number
): number | undefined {
  const value = process.env[name];
  if (!value) return defaultValue;
  return parseInt(value, 10);
}

/**
 * Parse boolean environment variables
 */
export function getEnvBoolean(
  name: string,
  defaultValue: boolean = false
): boolean {
  const value = process.env[name]?.toLowerCase();
  if (!value) return defaultValue;
  return value === "true" || value === "1" || value === "yes";
}
