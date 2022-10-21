import { AppRouter } from '@economica/bot/src/routers/_app';
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

export const trpc = createTRPCNext<AppRouter>({
	config({ ctx }) {
		return {
			links: [
				httpBatchLink({
					/**
					 * If you want to use SSR, you need to use the server's full URL
					 * @link https://trpc.io/docs/ssr
					 **/
					url: 'http://localhost:3001/trpc'
				})
			]
			/**
			 * @link https://react-query-v3.tanstack.com/reference/QueryClient
			 **/
			// queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
		};
	},
	/**
	 * @link https://trpc.io/docs/ssr
	 **/
	ssr: true
});
// => { useQuery: ..., useMutation: ...}
