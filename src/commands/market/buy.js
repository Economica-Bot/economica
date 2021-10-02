const inventorySchema = require('@schemas/inventory-sch');
const marketItemSchema = require('@schemas/market-item-sch');

module.exports = {
  name: 'buy',
  group: 'market',
  description: 'Purchase an item from the market.',
  format: '<item>',
  global: true,
  options: [
    {
      name: 'item',
      description: 'Specify the item you wish to buy.',
      type: 3,
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    let color = 'BLURPLE',
      title = author.user.username,
      icon_url = author.user.displayAvatarURL(),
      description;
    const currencySymbol = await util.getCurrencySymbol(guild.id),
      item = options._hoistedOptions[0].value;
    const inventory = await inventorySchema.findOne({
      userID: author.id,
      guildID: guild.id,
    });

    const owned = inventory?.inventory.find((i) => {
      return i.item === item;
    });

    if (owned) {
      color = 'RED';
      description = `You already have a(n) \`${item}\`.`;
    } else {
      const listing = await marketItemSchema.findOne({
        guildID: guild.id,
        item,
        active: true,
      });
      if (!listing) {
        color = 'RED';
        description = `\`${item}\` not found in market.`;
      } else {
        const price = listing.price;
        const desc = listing.description;
        const { wallet } = await util.getEconInfo(guild.id, author.id);

        if (wallet < price) {
          color = 'RED';
          description = `Insufficient funds!\nYour wallet: ${currencySymbol}${wallet.toLocaleString()} | Price of \`${item}\`: ${currencySymbol}${price.toLocaleString()} `;
        } else {
          color = 'GREEN';
          description = `Successfully purchased \`${item}\` for ${currencySymbol}${price.toLocaleString()}`;
          util.transaction(
            guild.id,
            author.user.id,
            this.name,
            `Purchased \`${item}\``,
            -price,
            0,
            -price
          );
          await inventorySchema.findOneAndUpdate(
            {
              userID: author.user.id,
              guildID: guild.id,
          ***REMOVED***
            {
              $push: {
                inventory: {
                  item,
                  price,
                  description: desc,
              ***REMOVED***
            ***REMOVED***
          ***REMOVED***
            {
              upsert: true,
              new: true,
            }
          );
        }
      }
    }

    const embed = util.embedify(color, title, icon_url, description);
    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
