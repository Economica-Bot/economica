import { Item } from '@economica/db';
import { z } from 'zod';
import { t } from '../trpc';

export const itemRouter = t.router({
	byListingId: t.procedure
		.input(z.object({ listing: z.object({ id: z.string() }) }))
		.query(async ({ ctx, input }) =>
			ctx.datasource
				.getRepository(Item)
				.find({ relations: ['listing'], where: input })
		),
	byListingOwnerId: t.procedure
		.input(
			z.object({
				listing: z.object({ id: z.string() }),
				owner: z.object({ userId: z.string(), guildId: z.string() })
			})
		)
		.query(async ({ ctx, input }) =>
			ctx.datasource
				.getRepository(Item)
				.findOne({ relations: ['listing'], where: input })
		),
	create: t.procedure
		.input(
			z.object({
				listing: z.object({ id: z.string() }),
				owner: z.object({ userId: z.string(), guildId: z.string() }),
				amount: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const item = ctx.datasource.getRepository(Item).create(input);
			return ctx.datasource.getRepository(Item).save(item);
		}),
	update: t.procedure
		.input(
			z.object({
				id: z.string(),
				listing: z.object({ id: z.string() }).optional(),
				owner: z.object({ userId: z.string(), guildId: z.string() }).optional(),
				amount: z.number().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const item = await ctx.datasource
				.getRepository(Item)
				.findOneByOrFail({ id: input.id });
			ctx.datasource.getRepository(Item).merge(item, input);
			return ctx.datasource.getRepository(Item).save(item);
		})
});
