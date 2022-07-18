import { Listing } from '../entities';
import { Job } from '../structures';

export class ListingsJob implements Job {
	public name = 'update-listings';
	public cooldown = 1000 * 60;
	public execute = async () => {
		const now = Date.now();
		const listings = await Listing.findBy({ active: true });
		await Listing.save(listings.filter((listing) => listing.createdAt.getTime() + listing.duration > now));
	};
}
