import { createTRPCProxyClient } from '@trpc/client';
import { httpLink } from '@trpc/client/links/httpLink';
import fetch from 'node-fetch';
import ws from 'ws';
import { AppRouter } from '@economica/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpLink({
			url: 'http://localhost:3000/api/trpc'
		})
	]
});
