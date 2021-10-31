const inventorySchema = require('@schemas/inventory-sch');
const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = {
  name: 'collect',
  description: 'Collect generator money.',
  group: 'economy',
  global: true,
  options: null,
  async run(interaction) {
    const user = await inventorySchema.findOne({
      guildID: interaction.guild.id,
      userID: interaction.member.id,
    });

    const now = new Date();
    const inventory = user.inventory;
    let amount = 0;

    await Promise.all(
      inventory.map(async (item) => {
        const shopItem = await shopItemSchema.findOne({
          guildID: interaction.guild.id,
          name: item.name,
        });
        const itemIndex = inventory.findIndex((i) => i.name == item.name);
        if (
          inventory[itemIndex].hasOwnProperty('collected') &&
          !inventory[itemIndex].collected
        ) {
          inventory[itemIndex].collected = true;
          inventory[itemIndex].lastGenerateAt = now.getTime();
          amount += shopItem.generatorAmount;
        }
      })
    );

    if (amount) {
      await util.transaction(
        interaction.guild.id,
        interaction.member.id,
        'GENERATOR',
        'Collected generator money',
        0,
        amount,
        amount
      );
      await interaction.reply(
        `Collected ${await util.getCurrencySymbol(
          interaction.guild.id
        )}${amount}`
      );
      await inventorySchema.findOneAndUpdate(
        {
          guildID: interaction.guild.id,
          userID: interaction.member.id,
      ***REMOVED***
        {
          inventory,
        }
      );
    } else {
      await interaction.reply({
        content: 'You do not have any money to collect.',
        ephemeral: true,
      });
    }
***REMOVED***
};
