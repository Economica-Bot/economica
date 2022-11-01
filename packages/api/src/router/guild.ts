import { Guild } from '@economica/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { GuildSchema } from '../schemas';
import { t } from '../trpc';

export const guildRouter = t.router({
	update: t.procedure.input(GuildSchema).mutation(async ({ ctx, input }) => {
		const guild = await Guild.findOneBy({ id: input.id });
		if (!guild)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No guild with id ${input.id}`
			});
		ctx.datasource.manager.merge(Guild, guild, input, { currency: 'asd' });
		Guild.merge<Guild>(guild, input);
		await guild?.save();
		return guild;
	}),
	byId: t.procedure.input(z.string()).query(async ({ input }) => {
		const guild = await Guild.findOneBy({ id: input });
		if (!guild)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No guild with id ${input}`
			});
		return guild;
	})
});
