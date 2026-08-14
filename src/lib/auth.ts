import { betterAuth } from "better-auth"
import { Pool } from "pg"

const globalForAuth = globalThis as unknown as { authPool?: Pool }
const authPool = globalForAuth.authPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 10 })
if (process.env.NODE_ENV !== "production") globalForAuth.authPool = authPool

export const auth = betterAuth({
  database: authPool,
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  trustedOrigins: [process.env.BETTER_AUTH_URL, process.env.V0_DEV_APP_URL, process.env.V0_RUNTIME_URL].filter(Boolean) as string[],
})
