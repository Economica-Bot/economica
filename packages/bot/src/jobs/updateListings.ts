import { Listing } from '../entities';
import { Job } from '../structures';

export class ListingsJob implements Job {
	public name = 'update-listings';

	public cooldown = 1000 * 60;

	public execution = async () => {
		const listings = await Listing.findBy({ active: true });
		listings
			.filter(
				(listing) => listing.createdAt.getTime() + listing.duration < Date.now()
			)
			.forEach(async (listing) => {
				listing.active = false;
				await listing.save();
			});
	};
}
