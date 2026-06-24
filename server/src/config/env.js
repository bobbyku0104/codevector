import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Validate and freeze environment configuration at boot.
 * Failing fast here is far cheaper than discovering a missing var at request time.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/codevector'),
  CORS_ORIGINS: z.string().default('*'),
  DEFAULT_PAGE_SIZE: z.coerce.number().int().positive().default(20),
  MAX_PAGE_SIZE: z.coerce.number().int().positive().default(100),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = Object.freeze({
  ...parsed.data,
  corsOrigins:
    parsed.data.CORS_ORIGINS === '*'
      ? '*'
      : parsed.data.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  isProd: parsed.data.NODE_ENV === 'production',
});

export default env;
