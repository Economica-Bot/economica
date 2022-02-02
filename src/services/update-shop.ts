import { SERVICE_COOLDOWNS } from '../config';
import { ShopModel } from '../models';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	public name = 'update-shop';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_SHOP;
	public execute = async (client: EconomicaClient): Promise<void> => {
		const now = new Date();
		const conditional = {
			active: true,
			duration: {
				$ne: null as number,
			},
		};

		const results = await ShopModel.find(conditional);

		if (results?.length) {
			for (const result of results) {
				const { duration, createdAt } = result;
				if (createdAt.getTime() + duration < now.getTime()) {
					await ShopModel.findOneAndUpdate(
						{
							name: result.name,
						},
						{
							active: false,
						}
					);
				}
			}
		}
	};
}
