import { Listing } from '../entities/index.js';
import { Economica, Job } from '../structures/index.js';

export default class implements Job {
	public name = 'update-listings';
	public cooldown = 1000 * 60;
	public execute = async (client: Economica) => {
		const now = Date.now();
		const listings = await Listing.findBy({ active: true });
		await Listing.save(listings.filter((listing) => listing.createdAt.getTime() + listing.duration > now));
	};
}
