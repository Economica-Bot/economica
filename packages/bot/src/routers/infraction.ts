import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Infraction, InfractionSchema } from '../entities';
import { publicProcedure, router } from '../trpc';

export const infractionRouter = router({
	count: publicProcedure
		.input(z.string())
		.query(({ input }) => Infraction.countBy({ guild: { id: input } })),
	list: publicProcedure
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
	byId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const infraction = await Infraction.findOneBy({ id: input });
		if (!infraction)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No infraction with id ${input}`
			});
		return infraction;
	}),
	update: publicProcedure
		.input(InfractionSchema)
		.mutation(async ({ input }) => {
			const infraction = await Infraction.findOneBy({ id: input.id });
			if (!infraction)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `No infraction with id ${input.id}`
				});
			Infraction.merge(infraction, input);
			await infraction?.save();
			return infraction;
		})
});
