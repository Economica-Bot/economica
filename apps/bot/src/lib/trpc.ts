import { AppRouter } from '@economica/api';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import fetch from 'node-fetch';
import ws from 'ws';
import { env } from '../env.mjs';
import SuperJSON from 'superjson';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const host =
	env.NODE_ENV === 'production' ? 'host.docker.internal' : 'localhost';

export const trpc = createTRPCProxyClient<AppRouter>({
	transformer: SuperJSON,
	links: [
		httpBatchLink({
			url: `http://${host}:3000/api/trpc`
		})
	]
});
