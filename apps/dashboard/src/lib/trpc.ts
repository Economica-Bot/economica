import { AppRouter } from '@economica/api';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

export const trpc = createTRPCNext<AppRouter>({
	config({ ctx }) {
		return {
			links: [
				httpBatchLink({
					url: '/api/trpc'
				}),
				loggerLink({
					enabled: () => true
				})
			]
		};
	}
});
