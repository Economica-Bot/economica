import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({ path: `${path.join(process.cwd(), '../../.env.local')}` });

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),
	DB_OPTION: z.enum(['nothing', 'sync', 'drop']),
	DB_HOST: z.string(),
	DB_PORT: z.string().transform((s) => Number(s)),
	DB_USERNAME: z.string(),
	DB_PASSWORD: z.string()
});

const _env = schema.safeParse(process.env);

if (!_env.success) {
	console.error(
		'❌ Invalid environment variables:\n',
		JSON.stringify(env.error.format(), null, 4)
	);
	process.exit(1);
}

export const env = _env.data;
