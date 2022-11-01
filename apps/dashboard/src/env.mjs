import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({ path: `${path.join(process.cwd(), '../../.env.local')}` });

export const schema = z.object({
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	NEXTAUTH_SECRET: z.string(),
	NEXTAUTH_URL: z.string().url()
});

export const formatErrors = (
	/** @type {import('zod').ZodFormattedError<Map<string,string>,string>} */
	errors
) =>
	Object.entries(errors)
		.map(([name, value]) => {
			if (value && '_errors' in value)
				return `${name}: ${value._errors.join(', ')}\n`;
		})
		.filter(Boolean);

const _env = schema.safeParse(process.env);

if (!_env.success) {
	console.error(
		'❌ Invalid environment variables:\n',
		...formatErrors(_env.error.format())
	);
	throw new Error('Invalid environment variables');
} else {
	console.log('✔ Environment variables loaded');
}

export const env = _env.data;
