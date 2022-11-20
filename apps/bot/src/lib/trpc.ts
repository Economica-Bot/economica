import { AppRouter } from '@economica/api';
import { createTRPCProxyClient } from '@trpc/client';
import { httpLink } from '@trpc/client/links/httpLink';
import fetch from 'node-fetch';
import { env } from 'src/env.mjs';
import ws from 'ws';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const host =
	env.NODE_ENV === 'production' ? 'host.docker.internal' : 'localhost';

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpLink({
			url: `http://${host}:3000/api/trpc`
		})
	]
});
