import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { User } from '../entities';
import { publicProcedure, router } from '../trpc';

export const userRouter = router({
	list: publicProcedure
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
		.query(({ input }) =>
			User.find({
				take: input.limit,
				skip: input.page
			})
		),
	byId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const user = await User.findOneBy({ id: input });
		if (!user)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No user with id ${input}`
			});
		return user;
	})
});
