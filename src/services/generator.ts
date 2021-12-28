import { ShopModel } from "../models/shops";

import { MemberModel } from "../models/members";

export const name = 'generator';

export async function execute() {
	setInterval(async () => {
		const now = new Date();
		const members = await MemberModel.find();
		for (const member of members) {
			for (const item of member.inventory) {
				const shopItem = await ShopModel.findOne({
					guildID: String(member.guildID),
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
						guildID: member.guildID,
						userID: member.userID,
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
}
