import { Guild } from '@economica/db';
import { z } from 'zod';
import { GuildSchema } from '../schemas';
import { t } from '../trpc';

export const guildRouter = t.router({
	update: t.procedure.input(GuildSchema).mutation(async ({ ctx, input }) => {
		const guild = await ctx.datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: input.id });
		ctx.datasource.getRepository(Guild).merge(guild, input);
		return ctx.datasource.getRepository(Guild).save(guild);
	}),
	byId: t.procedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Guild).findOneByOrFail(input)
		),
	create: t.procedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) =>
			ctx.datasource.getRepository(Guild).save(input)
		)
});
