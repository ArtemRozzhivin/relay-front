import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Type-safe, validated environment variables. Client vars MUST be prefixed with
 * `NEXT_PUBLIC_` and listed under both `client` and `experimental__runtimeEnv`.
 * Add your own keys here — validation runs at build time (see `next.config.ts`).
 */
export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
	},
	client: {
		NEXT_PUBLIC_API_URL: z.string().url().optional(),
		NEXT_PUBLIC_MEDIA_HOST: z.string().min(1).optional(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_MEDIA_HOST: process.env.NEXT_PUBLIC_MEDIA_HOST,
	},
	emptyStringAsUndefined: true,
});
