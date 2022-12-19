import cron from 'node-cron';
import { trpc } from '../lib/trpc';

export const ListingsJob = cron.schedule('* * * * *', async () => {
	console.info('updating active listings');
	const listings = await trpc.listing.getActive.query();
	listings
		.filter(
			(listing) =>
				listing.duration &&
				listing.createdAt.getTime() + listing.duration < Date.now()
		)
		.forEach(async (listing) => {
			await trpc.listing.update.mutate({ id: listing.id, active: false });
		});
});
