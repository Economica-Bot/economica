const inventorySchema = require('@schemas/inventory-sch');
const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = () => {
	const generate = async () => {
		const now = new Date();
		const users = await inventorySchema.find();
		for (const user of users) {
			for (const item of user.inventory) {
				const shopItem = await shopItemSchema.findOne({
					guildID: user.guildID,
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

				await inventorySchema.findOneAndUpdate(
					{
						guildID: user.guildID,
						userID: user.userID,
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

		//Check for generators every 5 seconds
		setTimeout(generate, 1000 * 5);
	};

	generate();
};
