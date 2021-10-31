const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = {
  name: 'shop',
  description: "View the server's shop items.",
  group: 'shop',
  permissions: ['ADMINISTRATOR'],
  global: true,
  options: null,
  async run(interaction) {
    let embed = new Discord.MessageEmbed();
    embed
      .setAuthor(`${interaction.guild.name} Shop`, interaction.guild.iconURL())
      .setColor('BLUE');
    const items = await util.getShopItems(interaction.guild.id);
    if (items.length === 0) {
      embed.setDescription(
        `There are currently \`0\` items in the shop.\nAsk your Economy Manager to add some!`
      );
    } else {
      const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);
      let count = 0;
      items.forEach((item) => {
        if (item.active) {
          count++;
          embed.addField(
            `${currencySymbol}${
              item.price > 0 ? util.num(item.price) : 'Free'
            } - ${util.cut(item.name)}`,
            util.cut(item.description, 200),
            item.description?.length > 100 ? false : true
          );
        }
      });
      embed.setDescription(
        `There are currently \`${count}\` items in the shop. Use the \`item view\` command to view detailed item stats, use the \`item buy\` command to purchase an item!`
      );
    }

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
