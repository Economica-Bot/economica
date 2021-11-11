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

    if (!user)
      return interaction.reply(util.error("You don't have any items."));
    const now = new Date();
    const inventory = user.inventory;
    let amount = 0;

    let description = 'Collected generator money\n';
    let count = 0;
    const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);

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
          await util.transaction(
            interaction.guild.id,
            interaction.member.id,
            'GENERATOR',
            `\`${shopItem.name}\``,
            0,
            shopItem.generatorAmount,
            shopItem.generatorAmount
          );
          description += `\n\`${++count}.\` **${
            shopItem.name
          }** | ${currencySymbol}${amount.toLocaleString()}`;
        }
      })
    );

    if (amount) {
      await interaction.reply(util.success(description));
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
      await interaction.reply(
        util.error('You do not have any money to collect.')
      );
    }
***REMOVED***
};
