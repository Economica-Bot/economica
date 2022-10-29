import { Member } from '@economica/db/entities';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { MemberUpdateSchema, MemberViewSchema } from '../schemas';
import { t } from '../trpc';

export const memberRouter = t.router({
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
			ctx.datasource.getRepository(Member).find({
				take: input.limit,
				skip: (input.page - 1) * input.limit
			})
		),
	byId: t.procedure.input(MemberViewSchema).query(async ({ ctx, input }) => {
		const user = await ctx.datasource
			.getRepository(Member)
			.findOneBy({ userId: input.userId, guildId: input.guildId });
		if (!user)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No member with user id ${input.userId} and guild id ${input.guildId}`
			});
		return user;
	}),
	update: t.procedure
		.input(MemberUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const member = await ctx.datasource
				.getRepository(Member)
				.findOneBy({ userId: input.userId, guildId: input.guildId });
			if (!member)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `No member with user id ${input.userId} and guild id ${input.guildId}`
				});
			return ctx.datasource.getRepository(Member).merge(member, input).save();
		})
});
