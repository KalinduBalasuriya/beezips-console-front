/**
 * Runtime configuration read from the environment.
 *
 * `NEXT_PUBLIC_` values are inlined into the browser bundle at build time, so
 * they must be referenced as literal `process.env.NEXT_PUBLIC_*` expressions —
 * a dynamic lookup would not be replaced. Nothing secret belongs here.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and set it.`,
    );
  }
  return value;
}

/** Base URL of the Beezips ERP API, including the `/api` prefix, with no
 *  trailing slash — e.g. `https://localhost:7032/api`. */
export const API_BASE_URL = required(
  "NEXT_PUBLIC_API_BASE_URL",
  process.env.NEXT_PUBLIC_API_BASE_URL,
).replace(/\/+$/, "");
