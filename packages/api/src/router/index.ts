import { CommandData } from '@economica/common';

import { t } from '../trpc';

import { discordRouter } from './discord';
import { guildRouter } from './guild';
import { infractionRouter } from './infraction';
import { memberRouter } from './member';
import { transactionRouter } from './transaction';
import { userRouter } from './user';

export const appRouter = t.router({
	commands: t.procedure.query(() => CommandData),
	discord: discordRouter,
	guild: guildRouter,
	infraction: infractionRouter,
	transaction: transactionRouter,
	user: userRouter,
	member: memberRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
