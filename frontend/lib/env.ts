import { z } from 'zod'

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/customer/chat'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/customer/chat'),

  // Qwen AI (OpenAI-compatible API)
  QWEN_API_KEY: z.string().min(1),
  QWEN_BASE_URL: z.string().url().default('https://api.qwen.ai/v1'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

let env: Env | null = null

/**
 * Validate and get environment variables
 * @throws Error if required environment variables are missing
 */
export function getEnv(): Env {
  if (env) {
    return env
  }

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    QWEN_API_KEY: process.env.QWEN_API_KEY,
    QWEN_BASE_URL: process.env.QWEN_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  })

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.format())
    throw new Error('Invalid environment variables. Check .env.local file.')
  }

  env = parsed.data
  return env
}

/**
 * Validate environment variables at startup (development only)
 */
export function validateEnv(): void {
  if (process.env.NODE_ENV === 'development') {
    try {
      getEnv()
      console.log('✅ Environment variables validated successfully')
    } catch (error) {
      console.error('❌ Environment validation failed')
      console.error('Please copy .env.example to .env.local and fill in the values')
    }
  }
}
