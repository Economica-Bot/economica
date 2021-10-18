const inventorySchema = require('@schemas/inventory-sch');
const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = () => {
  const generate = async () => {
    const users = await inventorySchema.find();
    for (const user of users) {
      for (const item of user.inventory) {
        const shopItem = await shopItemSchema.findOne({
          guildID: user.guildID,
          name: item.name,
        });
      }
    }

    //Check for generators every 5 seconds
    setTimeout(generate, 1000 * 5)
  };

  generate();
};
