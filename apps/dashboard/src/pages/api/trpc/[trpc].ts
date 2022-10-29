import { appRouter, createContext } from '@economica/api';
import { createNextApiHandler } from '@trpc/server/adapters/next';

export default createNextApiHandler({
	router: appRouter,
	createContext: createContext
});
