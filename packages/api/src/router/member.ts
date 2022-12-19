import { Member } from '@economica/db';
import { z } from 'zod';
import {
	MemberCreateSchema,
	MemberUpdateSchema,
	MemberViewSchema
} from '../schemas';
import { t } from '../trpc';

export const memberRouter = t.router({
	list: t.procedure
		.input(
			z
				.object({
					page: z.number().min(1).default(1),
					limit: z.number().min(1).max(100).default(10),
					guildId: z.string().optional()
				})
				.default({
					page: 1,
					limit: 10
				})
		)
		.query(({ ctx, input }) =>
			ctx.datasource.getRepository(Member).find({
				take: input.limit,
				skip: (input.page - 1) * input.limit,
				where: {
					guildId: input.guildId
				},
				order: {
					wallet: 'DESC',
					treasury: 'DESC'
				}
			})
		),
	byId: t.procedure
		.input(MemberViewSchema)
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Member).findOneByOrFail(input)
		),
	create: t.procedure
		.input(MemberCreateSchema)
		.mutation(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Member).save(input)
		),
	update: t.procedure
		.input(MemberUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const member = await ctx.datasource
				.getRepository(Member)
				.findOneByOrFail({ userId: input.userId, guildId: input.guildId });
			ctx.datasource.getRepository(Member).merge(member, input);
			return ctx.datasource.getRepository(Member).save(member);
		})
});
