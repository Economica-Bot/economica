import { commandData } from '../lib';
import { publicProcedure, router } from '../trpc';
import { discordRouter } from './discord';
import { guildRouter } from './guild';
import { infractionRouter } from './infraction';
import { transactionRouter } from './transaction';
import { userRouter } from './user';

export const appRouter = router({
	commands: publicProcedure.query(() => commandData),
	discord: discordRouter,
	guild: guildRouter,
	infraction: infractionRouter,
	transaction: transactionRouter,
	user: userRouter
});

export type AppRouter = typeof appRouter;
