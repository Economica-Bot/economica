module.exports = {
  name: 'shop',
  description: "View the server's shop items.",
  group: 'shop',
  permissions: ['ADMINISTRATOR'],
  global: true,
  options: [
    {
      name: 'page',
      description: 'Specify the page.',
      type: 'INTEGER',
      required: false,
  ***REMOVED***
  ],
  async run(interaction) {
    await interaction.deferReply();
    const items = await util.getShopItems(interaction.guild.id);
    if (items.length === 0) {
      interaction.reply(
        `There are currently \`0\` items in the shop.\nAsk your Economy Manager to add some!`
      );
      return;
    } else {
      const page = interaction.options.getInteger('page') ?? 1;
      const embeds = [];
      let maxEntries = 15;
      const shopEntries = [];
      const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);
      items.forEach((item) => {
        if (item.active) {
          shopEntries.push(item);
        }
      });
      const pageCount = Math.ceil(shopEntries.length / maxEntries); // Numerator as shopEntries instead of items to ignore deactivated items.

      let k = 0;
      for (let i = 0; i < pageCount; i++) {
        // Construct each page
        let embed = new Discord.MessageEmbed()
          .setAuthor(
            `${interaction.guild.name} Shop`,
            interaction.guild.iconURL()
          )
          .setColor('BLUE');
        for (let j = 0; j < maxEntries; j++) {
          if (shopEntries[k]) {
            const item = shopEntries[k];
            // Push fields for each active item to the page
            embed.addField(
              `${currencySymbol}${
                item.price > 0 ? util.num(item.price) : 'Free'
              } - ${util.cut(item.name)}`,
              util.cut(item.description, 200),
              item.description?.length > 100 ? false : true
            );
            k++;
          }
        }
        embeds.push(
          embed
            .setDescription(
              `There are currently \`${shopEntries.length}\` items in the shop. Use the \`item view\` command to view detailed item stats, use the \`item buy\` command to purchase an item!`
            )
            .setFooter(`Page ${i + 1} of ${pageCount}`)
        );
      }

      await util.paginate(interaction, embeds, page - 1);
    }
***REMOVED***
};
