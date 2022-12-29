import { z } from 'zod';

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),
	DISCORD_BOT_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	NEXTAUTH_SECRET: z.string(),
	NEXTAUTH_URL: z.string().url(),
	DB_URL: z.string().url(),
	DB_OPTION: z.enum(['nothing', 'sync', 'drop']),
	SUPPORT_GUILD_INVITE_URL: z.string().url(),
	INVITE_BOT_URL: z.string().url()
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
