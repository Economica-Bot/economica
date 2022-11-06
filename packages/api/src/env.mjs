import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({ path: `${path.join(process.cwd(), '../../.env.local')}` });

export const schema = z.object({
	DISCORD_BOT_TOKEN: z.string()
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
}

export const env = _env.data;
