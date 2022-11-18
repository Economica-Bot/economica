import { User } from '@economica/db';
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
		await ctx.datasource.getRepository(User).upsert({ id: input }, ['id']);
		return ctx.datasource.getRepository(User).findOneByOrFail({ id: input });
	}),
	update: t.procedure.input(UserSchema).mutation(async ({ ctx, input }) => {
		const user = await ctx.datasource
			.getRepository(User)
			.findOneByOrFail({ id: input.id });
		ctx.datasource.getRepository(User).merge(user, input);
		await user.save();
		return user;
	})
});
