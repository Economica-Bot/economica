const inventorySchema = require('@schemas/inventory-sch');
const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = {
  name: 'collect',
  description: 'Collect generator money.',
  group: 'economy',
  global: true,
  options: null,
  async run(interaction, guild, member) {
    const user = await inventorySchema.find({
      guildID: guild.id,
      userID: member.user.id,
    });

    for(const item of user.inventory) {
      
    }
***REMOVED***
};
