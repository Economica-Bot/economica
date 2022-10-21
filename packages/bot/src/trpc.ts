import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import trpcExpress from '@trpc/server/adapters/express';

export const createContext = ({
	req,
	res
}: trpcExpress.CreateExpressContextOptions) => {
	res.setHeader('Content-Type', 'application/json');
	return { req, res };
};
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
