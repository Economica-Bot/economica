const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = {
  name: 'shop',
  description: "View the server's shop items.",
  group: 'shop',
  permissions: ['ADMINISTRATOR'],
  global: true,
  options: null,
  async run(interaction) {
    await interaction.deferReply();

    const items = await util.getShopItems(interaction.guild.id);
    if (items.length === 0) {
      interaction.reply(
        `There are currently \`0\` items in the shop.\nAsk your Economy Manager to add some!`
      );
      return;
    } else {
      const embeds = [];
      let entries = 15;
      let pageCount = Math.ceil(items.length / entries);
      const shopEntries = [];
      const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);
      items.forEach((item) => {
        if (item.active) {
          shopEntries.push(`${currencySymbol}**${
            item.price > 0 ? util.num(item.price) : 'Free'
          } - __*${util.cut(item.name)}*__**\n
            ${util.cut(item.description, 200)}\n\n`);
        }
      });

      let k = 0;
      for (let i = 0; i < pageCount; i++) {
        description = '';
        for (let j = 0; j < entries; j++) {
          if (shopEntries[k]) {
            description += shopEntries[k++];
          }
        }
        embeds.push(
          new Discord.MessageEmbed()
            .setAuthor(
              `${interaction.guild.name} Shop`,
              interaction.guild.iconURL()
            )
            .setColor('BLUE')
            .setDescription(description)
            .setFooter(
              `There are currently \`${k}\` items in the shop. Use the \`item view\` command to view detailed item stats, use the \`item buy\` command to purchase an item!`
            )
        );
      }

      await util.paginate(interaction, embeds);
    }
***REMOVED***
};
