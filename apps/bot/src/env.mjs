import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({ path: `${path.join(process.cwd(), '../../.env.local')}` });

export const schema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),
	DISCORD_BOT_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	DISCORD_PUB_KEY: z.string(),
	DISCORD_CALLBACK_URL: z.string(),
	PORT: z.string(),
	DEV_IDS: z.string().transform((string) => JSON.parse(string)),
	DEV_GUILD_IDS: z.string().transform((val, ctx) => {
		const parsed = JSON.parse(val);
		if (
			Array.isArray(parsed) &&
			parsed.every((item) => typeof item === 'string')
		)
			return parsed;

		ctx.addIssue({
			code: z.ZodIssueCode.invalid_type,
			message: 'Not a string array'
		});
		return z.NEVER;
	}),
	SUPPORT_GUILD_ID: z.string(),
	INVITE_URL: z.string(),
	DEPLOY_COMMANDS: z.enum(['nothing', 'update', 'reset']),
	DEPLOY_ALL_MODULES: z
		.enum(['true', 'false'])
		.transform((val) => val === 'true'),
	DB_URI: z.string(),
	DB_OPTION: z.enum(['nothing', 'sync', 'drop'])
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
