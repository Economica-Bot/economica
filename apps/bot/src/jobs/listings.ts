import { datasource, Listing } from '@economica/db';
import cron from 'node-cron';

export const ListingsJob = cron.schedule('* * * * *', async () => {
	console.info('updating active listings');
	const listings = await datasource.getRepository(Listing).find();
	const expiredListings = listings
		.filter(
			(listing) =>
				listing.duration &&
				listing.createdAt.getTime() + listing.duration < Date.now()
		)
		.map((listing) => listing.id);
	await datasource
		.getRepository(Listing)
		.update(expiredListings, { active: false });
});
