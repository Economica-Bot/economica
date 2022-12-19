import { ListingType } from '@economica/common';
import { Listing } from '@economica/db';
import { z } from 'zod';
import { t } from '../trpc';

export const listingRouter = t.router({
	getActive: t.procedure.query(({ ctx }) =>
		ctx.datasource.getRepository(Listing).findBy({ active: true })
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
			ctx.datasource.getRepository(Listing).find({
				take: input.limit,
				skip: (input.page - 1) * input.limit,
				where: {
					guild: { id: input.guildId }
				},
				order: {
					createdAt: 'DESC'
				}
			})
		),
	byId: t.procedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) =>
			ctx.datasource
				.getRepository(Listing)
				.findOne({ relations: ['guild', 'itemsRequired'], where: input })
		),
	create: t.procedure
		.input(
			z.object({
				guild: z.object({ id: z.string() }),
				type: z.nativeEnum(ListingType),
				name: z.string(),
				price: z.number().int().nonnegative(),
				treasuryRequired: z.number().int().nonnegative(),
				description: z.string(),
				duration: z.number().positive().nullable(),
				stock: z.number().positive().nullable(),
				active: z.boolean(),
				stackable: z.boolean(),
				tradeable: z.boolean(),
				itemsRequired: z.array(z.object({ id: z.string() })),
				rolesRequired: z.array(z.string()),
				rolesGranted: z.array(z.string()),
				rolesRemoved: z.array(z.string()),
				generatorPeriod: z.number().positive().nullable(),
				generatorAmount: z.number().positive().nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const listing = ctx.datasource.getRepository(Listing).create(input);
			return ctx.datasource.getRepository(Listing).save(listing);
		}),
	update: t.procedure
		.input(
			z.object({
				id: z.string(),
				stock: z.number().optional(),
				active: z.boolean().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const listing = await ctx.datasource
				.getRepository(Listing)
				.findOneByOrFail({ id: input.id });
			ctx.datasource.getRepository(Listing).merge(listing, input);
			return ctx.datasource.getRepository(Listing).save(listing);
		}),
	delete: t.procedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const listing = await ctx.datasource
				.getRepository(Listing)
				.findOneByOrFail({ id: input.id });
			return ctx.datasource.getRepository(Listing).remove(listing);
		})
});
