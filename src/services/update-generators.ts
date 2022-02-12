import { SERVICE_COOLDOWNS } from '../config';
import { MemberModel, ShopModel } from '../models';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	public name = 'update-generators';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_GENERATORS;
	public execute = async (client: EconomicaClient): Promise<void> => {
		const now = new Date();
		const members = await MemberModel.find();
		for (const member of members) {
			for (const item of member.inventory) {
				const shopItem = await ShopModel.findOne({ _id: item.refId });
				if (shopItem.type === 'GENERATOR') {
					if (!item.hasOwnProperty('lastGenerateAt')) {
						item.lastGenerateAt = now.getTime();
					}
					if (!item.hasOwnProperty('collected')) {
						item.collected = false;
					}
					if (item.lastGenerateAt + shopItem.generatorPeriod < now.getTime()) {
						item.collected = false;
					}
				}

				await MemberModel.findOneAndUpdate(
					{
						guildId: member.guildId,
						userId: member.userId,
						'inventory.refId': item.refId,
					},
					{
						$set: {
							'inventory.$': item,
						},
					}
				);
			}
		}
	};
}
