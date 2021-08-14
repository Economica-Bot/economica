const marketItemSchema = require('@schemas/market-item-sch');

module.exports = {
  name: 'market',
  group: 'market',
  description: 'Buy and sell items on the market.',
  global: true,
  options: null,
  async run(interaction, guild, author, options) {
    const currencySymbol = await util.getCurrencySymbol(guild.id);
    const listings = await marketItemSchema
      .find({
        guildID: guild.id,
        active: true,
      })
      .sort({
        price: -1,
      });

    let shopEmbed = util.embedify('BLURPLE', guild.name, guild.iconURL());

    let i = 0;
    for (const listing of listings) {
      i++;
      shopEmbed.addField(
        `${currencySymbol}${listing.price.toLocaleString()}: \`${
          listing.item
        }\``,
        `${listing.description}`
      );
    }

    shopEmbed.setDescription(`There are \`${i}\` listings.`);

    await client.api
      .interactions(interaction.id, interaction.token)
      .callback.post({
        data: {
          type: 4,
          data: {
            embeds: [shopEmbed],
        ***REMOVED***
      ***REMOVED***
      });
***REMOVED***
};
