import { Command } from '@economica/db';
import { z } from 'zod';
import { ExecutionSchema } from '../schemas';
import { t } from '../trpc';

export const executionRouter = t.router({
	count: t.procedure
		.input(ExecutionSchema)
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Command).countBy({ member: input })
		),
	create: t.procedure
		.input(
			z.object({
				command: z.string(),
				member: z.object({ userId: z.string(), guildId: z.string() })
			})
		)
		.mutation(async ({ ctx, input }) => {
			const command = ctx.datasource.getRepository(Command).create(input);
			return ctx.datasource.getRepository(Command).save(command);
		}),
	findMostRecent: t.procedure
		.input(
			z.object({
				member: z.object({ userId: z.string(), guildId: z.string() }),
				command: z.string()
			})
		)
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Command).findOne({
				order: { createdAt: 'DESC' },
				where: input
			})
		)
});
