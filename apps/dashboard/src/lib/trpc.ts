import { AppRouter } from '@economica/api';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import SuperJSON from 'superjson';

export const trpc = createTRPCNext<AppRouter>({
	config() {
		return {
			transformer: SuperJSON,
			links: [
				httpBatchLink({
					url: '/api/trpc'
				}),
				loggerLink({
					enabled: (opts) =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error)
				})
			]
		};
	}
});
