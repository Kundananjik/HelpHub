import { z } from "zod";

/**
 * Server-side environment variable validation.
 *
 * Import this module from server-only code (Prisma client, mailer, rate limiter)
 * so misconfiguration fails fast with a clear message instead of surfacing as a
 * cryptic runtime error. Do NOT import it from Edge middleware.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection URL"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required (generate with `openssl rand -base64 32`)")
    .optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.string().optional(),

  // Optional integrations — features degrade gracefully when unset.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  APP_URL: z.string().optional(),
});

function buildEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  // At least one auth secret must be present.
  if (!parsed.data.AUTH_SECRET && !parsed.data.NEXTAUTH_SECRET) {
    throw new Error(
      "Invalid environment variables:\n  - AUTH_SECRET or NEXTAUTH_SECRET is required"
    );
  }
  return parsed.data;
}

export const env = buildEnv();

export const appUrl =
  env.APP_URL ?? env.NEXTAUTH_URL ?? "http://localhost:3000";
