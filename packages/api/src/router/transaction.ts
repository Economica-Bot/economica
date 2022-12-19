import { Transaction } from '@economica/db';
import { z } from 'zod';
import { TransactionCreateSchema, TransactionUpdateSchema } from '../schemas';
import { t } from '../trpc';

export const transactionRouter = t.router({
	count: t.procedure
		.input(z.string())
		.query(({ ctx, input }) =>
			ctx.datasource
				.getRepository(Transaction)
				.countBy({ guild: { id: input } })
		),
	list: t.procedure
		.input(
			z.object({
				guildId: z.string(),
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(5)
			})
		)
		.query(({ ctx, input }) =>
			ctx.datasource.getRepository(Transaction).find({
				take: input.limit,
				skip: (input.page - 1) * input.limit,
				where: { guild: { id: input.guildId } },
				relations: ['agent', 'target', 'guild'],
				order: { createdAt: 'DESC' }
			})
		),
	byId: t.procedure
		.input(z.string())
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Transaction).findOneByOrFail({ id: input })
		),
	create: t.procedure
		.input(TransactionCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const transaction = ctx.datasource
				.getRepository(Transaction)
				.create(input);
			return ctx.datasource.getRepository(Transaction).save(transaction);
		}),
	update: t.procedure
		.input(TransactionUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const transaction = await ctx.datasource
				.getRepository(Transaction)
				.findOneByOrFail({ id: input.id });
			ctx.datasource.getRepository(Transaction).merge(transaction, input);
			return ctx.datasource.getRepository(Transaction).save(transaction);
		})
});
