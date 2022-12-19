import { CommandData } from '@economica/common';

import { t } from '../trpc';

import { discordRouter } from './discord';
import { executionRouter } from './execution';
import { guildRouter } from './guild';
import { infractionRouter } from './infraction';
import { loanRouter } from './loan';
import { memberRouter } from './member';
import { transactionRouter } from './transaction';
import { userRouter } from './user';
import { listingRouter } from './listing';
import { itemRouter } from './item';

export const appRouter = t.router({
	commands: t.procedure.query(() => CommandData),
	discord: discordRouter,
	guild: guildRouter,
	infraction: infractionRouter,
	transaction: transactionRouter,
	user: userRouter,
	member: memberRouter,
	execution: executionRouter,
	loan: loanRouter,
	listing: listingRouter,
	item: itemRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
