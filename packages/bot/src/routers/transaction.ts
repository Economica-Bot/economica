import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Transaction, TransactionSchema } from '../entities';
import { publicProcedure, router } from '../trpc';

export const transactionRouter = router({
	count: publicProcedure
		.input(z.string())
		.query(({ input }) => Transaction.countBy({ guild: { id: input } })),
	list: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(10)
			})
		)
		.query(({ input }) =>
			Transaction.find({
				take: input.limit,
				skip: (input.page - 1) * input.limit,
				where: {
					guild: { id: input.guildId }
				},
				relations: ['agent', 'target', 'guild'],
				order: {
					createdAt: 'DESC'
				}
			})
		),
	byId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const transaction = await Transaction.findOneBy({ id: input });
		if (!transaction)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No transaction with id ${input}`
			});
		return transaction;
	}),
	update: publicProcedure
		.input(TransactionSchema)
		.mutation(async ({ input }) => {
			const transaction = await Transaction.findOneBy({ id: input.id });
			if (!transaction)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `No transaction with id ${input.id}`
				});
			Transaction.merge(transaction, input);
			await transaction?.save();
			return transaction;
		})
});
