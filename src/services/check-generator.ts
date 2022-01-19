import { Client } from 'discord.js';
import { EconomicaService } from '../structures';
import { ShopModel, MemberModel } from '../models';

export default class implements EconomicaService {
	name = 'check-generator';
	execute = (client: Client) => {
		setInterval(async () => {
			console.log(`Executing service ${this.name}`);
			const now = new Date();
			const members = await MemberModel.find();
			for (const member of members) {
				for (const item of member.inventory) {
					const shopItem = await ShopModel.findOne({
						guildId: String(member.guildId),
						name: item.name,
					});

					if (shopItem.type == 'generator') {
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
							'inventory.name': item.name,
						},
						{
							$set: {
								'inventory.$': item,
							},
						}
					);
				}
			}
		}, 1000 * 5);
	};
}
