import { InfractionStringArr } from '@economica/common';
import { Infraction } from '@economica/db';
import { z } from 'zod';
import { InfractionCreateSchema, InfractionUpdateSchema } from '../schemas';
import { t } from '../trpc';

export const infractionRouter = t.router({
	getActiveBans: t.procedure.query(({ ctx }) =>
		ctx.datasource.getRepository(Infraction).find({
			relations: ['guild', 'target', 'target.user'],
			where: { type: 'BAN', active: true }
		})
	),
	count: t.procedure
		.input(z.string())
		.query(({ ctx, input }) =>
			ctx.datasource.getRepository(Infraction).countBy({ guild: { id: input } })
		),
	list: t.procedure
		.input(
			z.object({
				guildId: z.string(),
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(10)
			})
		)
		.query(({ ctx, input }) =>
			ctx.datasource.getRepository(Infraction).find({
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
	byId: t.procedure
		.input(z.string())
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Infraction).findOneByOrFail({ id: input })
		),
	find: t.procedure
		.input(
			z.object({
				target: z.object({
					userId: z.string(),
					guildId: z.string()
				}),
				type: z.enum(InfractionStringArr)
			})
		)
		.query(
			async ({ ctx, input }) =>
				await ctx.datasource.getRepository(Infraction).findOneByOrFail(input)
		),
	update: t.procedure
		.input(InfractionUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const infraction = await ctx.datasource
				.getRepository(Infraction)
				.findOneByOrFail({ id: input.id });
			ctx.datasource.getRepository(Infraction).merge(infraction, input);
			ctx.datasource.getRepository(Infraction).save(infraction);
			return infraction;
		}),
	create: t.procedure
		.input(InfractionCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const infraction = ctx.datasource.getRepository(Infraction).create(input);
			return ctx.datasource.getRepository(Infraction).save(infraction);
		})
});
