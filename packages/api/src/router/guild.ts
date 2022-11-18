import { Guild } from '@economica/db';
import { z } from 'zod';

import { GuildSchema } from '../schemas';
import { t } from '../trpc';

export const guildRouter = t.router({
	update: t.procedure.input(GuildSchema).mutation(async ({ ctx, input }) => {
		const guild = await Guild.findOneByOrFail({ id: input.id });
		ctx.datasource.manager.merge(Guild, guild, input, { currency: 'asd' });
		Guild.merge<Guild>(guild, input);
		await guild?.save();
		return guild;
	}),
	byId: t.procedure.input(z.string()).query(async ({ input }) => {
		await Guild.upsert({ id: input }, ['id']);
		return await Guild.findOneByOrFail({ id: input });
	})
});
