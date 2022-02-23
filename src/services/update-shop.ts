import { FilterQuery } from 'mongoose';

import { Listing, ListingModel } from '../models/index.js';
import { Service } from '../structures/index.js';
import { SERVICE_COOLDOWNS } from '../typings/constants.js';

export default class implements Service {
	public service = 'update-shop';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_SHOP;
	public execute = async (): Promise<void> => {
		const now = new Date();
		const filter: FilterQuery<Listing> = { active: true, duration: { $ne: null as number } };
		const shops = await ListingModel.find(filter);
		if (shops?.length) {
			shops.forEach(async (shop) => {
				if (shop.createdAt.getTime() + shop.duration < now.getTime()) {
					await ListingModel.findOneAndUpdate({ name: shop.name }, { active: false });
				}
			});
		}
	};
}
