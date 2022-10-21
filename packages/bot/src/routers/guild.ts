import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { bot } from '..';
import { Guild, GuildSchema } from '../entities';
import { publicProcedure, router } from '../trpc';

export const guildRouter = router({
	update: publicProcedure.input(GuildSchema).mutation(async ({ input }) => {
		const guild = await Guild.findOneBy({ id: input.id });
		if (!guild)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No guild with id ${input.id}`
			});
		bot.db.manager.merge(Guild, guild, input, { currency: 'asd' });
		Guild.merge<Guild>(guild, input);
		await guild?.save();
		return guild;
	}),
	byId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const guild = await Guild.findOneBy({ id: input });
		if (!guild)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `No guild with id ${input}`
			});
		return guild;
	})
});
