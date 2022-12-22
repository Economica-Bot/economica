import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({ path: `${path.join(process.cwd(), '../../.env.local')}` });

const schema = z
	.object({
		NODE_ENV: z.enum(['development', 'test', 'production']),
		DB_URL: z.string(),
		DB_OPTION: z.enum(['nothing', 'sync', 'drop'])
	})
	.superRefine((e, ctx) => {
		if (e.NODE_ENV === 'production' && e.DB_OPTION === 'drop')
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Do not drop DB in production!'
			});
	});

const _env = schema.safeParse(process.env);

if (!_env.success) {
	console.error(
		'❌ Invalid environment variables:\n',
		JSON.stringify(_env.error.format(), null, 4)
	);
	throw new Error('Invalid environment variables');
}

export const env = _env.data;
