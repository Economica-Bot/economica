import { LoanStatus } from '@economica/common';
import { Loan } from '@economica/db';
import { z } from 'zod';
import { t } from '../trpc';

export const loanRouter = t.router({
	getActive: t.procedure.query(({ ctx }) =>
		ctx.datasource.getRepository(Loan).findBy({ status: LoanStatus.ACTIVE })
	),
	count: t.procedure
		.input(
			z.object({
				guild: z.object({ id: z.string() }),
				borrower: z.object({ user: z.object({ id: z.string() }) }).optional(),
				lender: z.object({ user: z.object({ id: z.string() }) }).optional(),
				status: z.nativeEnum(LoanStatus).optional()
			})
		)
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Loan).countBy(input)
		),
	create: t.procedure
		.input(
			z.object({
				guild: z.object({ id: z.string() }),
				lender: z.object({ userId: z.string(), guildId: z.string() }),
				borrower: z.object({ userId: z.string(), guildId: z.string() }),
				principal: z.number(),
				repayment: z.number(),
				message: z.string(),
				duration: z.number(),
				status: z.nativeEnum(LoanStatus)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const loan = ctx.datasource.getRepository(Loan).create(input);
			return ctx.datasource.getRepository(Loan).save(loan);
		}),
	list: t.procedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(10),
				guild: z.object({ id: z.string() }),
				borrower: z.object({ user: z.object({ id: z.string() }) }).optional(),
				lender: z.object({ user: z.object({ id: z.string() }) }).optional(),
				status: z.nativeEnum(LoanStatus).optional()
			})
		)
		.query(({ ctx, input }) =>
			ctx.datasource.getRepository(Loan).find({
				take: input.limit,
				skip: (input.page - 1) * input.limit,
				where: [
					{
						guild: { id: input.guild.id },
						lender: { userId: input.lender?.user.id },
						status: input.status
					},
					{
						guild: { id: input.guild.id },
						borrower: { userId: input.lender?.user.id },
						status: input.status
					}
				],
				relations: ['lender', 'borrower', 'guild'],
				order: {
					createdAt: 'DESC'
				}
			})
		),
	delete: t.procedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const loan = await ctx.datasource
				.getRepository(Loan)
				.findOneByOrFail({ id: input.id });
			return ctx.datasource.getRepository(Loan).remove(loan);
		}),
	update: t.procedure
		.input(
			z.object({
				id: z.string(),
				status: z.nativeEnum(LoanStatus).optional(),
				completedAt: z.date().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const loan = await ctx.datasource
				.getRepository(Loan)
				.findOneByOrFail({ id: input.id });
			ctx.datasource.getRepository(Loan).merge(loan, input);
			return ctx.datasource.getRepository(Loan).save(loan);
		}),
	byId: t.procedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Loan).findOneOrFail({
				relations: ['guild', 'lender', 'borrower'],
				where: input
			})
		)
});
