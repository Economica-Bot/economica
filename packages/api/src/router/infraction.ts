import { Infraction } from '@economica/db/entities';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { InfractionSchema } from '../schemas';
import { t } from '../trpc';

export const infractionRouter = t.router({
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
		.query(({ input }) =>
			Infraction.find({
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
	byId: t.procedure.input(z.string()).query(async ({ input }) => {
		const infraction = await Infraction.findOneBy({ id: input });
		if (!infraction)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No infraction with id ${input}`
			});
		return infraction;
	}),
	update: t.procedure
		.input(InfractionSchema)
		.mutation(async ({ ctx, input }) => {
			const infraction = await ctx.datasource
				.getRepository(Infraction)
				.findOneBy({ id: input.id });
			if (!infraction)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `No infraction with id ${input.id}`
				});
			ctx.datasource.getRepository(Infraction).merge(infraction, input);
			await infraction.save();
			return infraction;
		})
});
