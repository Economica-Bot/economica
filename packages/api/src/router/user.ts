import { User } from '@economica/db/entities';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UserSchema } from '../schemas';
import { t } from '../trpc';

export const userRouter = t.router({
	list: t.procedure
		.input(
			z
				.object({
					page: z.number().min(1).default(1),
					limit: z.number().min(1).max(100).default(10)
				})
				.default({
					page: 1,
					limit: 10
				})
		)
		.query(({ ctx, input }) =>
			ctx.datasource.getRepository(User).find({
				take: input.limit,
				skip: (input.page - 1) * input.limit
			})
		),
	byId: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
		const user = await ctx.datasource
			.getRepository(User)
			.findOneBy({ id: input });
		if (!user)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No user with id ${input}`
			});
		return user;
	}),
	update: t.procedure.input(UserSchema).mutation(async ({ ctx, input }) => {
		const user = await ctx.datasource
			.getRepository(User)
			.findOneBy({ id: input.id });
		if (!user)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No user with id ${input.id}`
			});
		ctx.datasource.getRepository(User).merge(user, input);
		await user.save();
		return user;
	})
});
