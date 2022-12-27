import { z } from 'zod';

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),
	DISCORD_BOT_TOKEN: z.string(),
	DEV_GUILD_IDS: z.string().transform((val, ctx) => {
		const parsed = val.split(',').map((v) => v.trim());
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
	SUPPORT_GUILD_INVITE_URL: z.string(),
	DEPLOY_COMMANDS: z.enum(['nothing', 'update', 'reset']),
	DEPLOY_ALL_MODULES: z
		.enum(['true', 'false'])
		.transform((val) => val === 'true'),
	DOCS_URL: z.string().url(),
	HOME_URL: z.string().url(),
	COMMANDS_URL: z.string().url(),
	VOTE_URL: z.string().url()
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
