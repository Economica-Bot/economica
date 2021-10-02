const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = {
  name: 'shop',
  description: "View the server's shop items.",
  group: 'shop',
  global: true,
  options: [
    {
      name: 'view',
      description: 'View all items in the shop.',
      type: apiTypes.Subcommand,
      options: null,
  ***REMOVED***
    {
      name: 'clear',
      description: 'Clear all items from the shop. This is irreversible.',
      type: apiTypes.Subcommand,
      options: [
        {
          name: 'confirm',
          description:
            'Are you sure you want to delete all shop items forever?',
          type: apiTypes.String,
          required: true,
          choices: [
            {
              name: 'Yes, delete all items permanently',
              value: 'confirmed',
          ***REMOVED***
            {
              name: 'No, cancel command',
              value: '',
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction, guild, member, options, fops) {
    const { _group, _subcommand, _hoistedOptions } = options;
    let embed = new Discord.MessageEmbed();

    if (_subcommand === 'view') {
      embed.setAuthor(`${guild.name} Shop`, guild.iconURL());
      embed.setColor('BLUE');
      const items = await util.getShopItems(guild.id);

      if (items.length === 0) {
        embed.setDescription(
          `There are currently \`0\` items in the shop.\nAsk your Economy Manager to add some!`
        );
      } else {
        const currencySymbol = await util.getCurrencySymbol(guild.id);
        embed.setDescription(
          `There are currently \`${items.length}\` items in the shop. Use the \`item view\` command to view detailed item stats, use the \`item buy\` command to purchase an item!`
        );
        items.forEach((item) => {
          embed.addField(
            `${currencySymbol}${item.price > 0 ? util.num(item.price) : 'Free'
            } - ${util.cut(item.name)}`,
            util.cut(item.description || 'A very interesting item.', 200),
            item.description?.length > 100 ? false : true
          );
        });
      }
    } else if (_subcommand === 'clear') {
      console.log(fops);
      if (!fops.confirm) {
        return interaction.reply(util.warning('Shop clear was aborted.'));
      } else {
        const items = await shopItemSchema.find({
          guildID: guild.id
        })
        console.log(items)
        if (items.length < 1) {
          // there are no items in the shop
          return await interaction.reply(util.error('There were no items in the shop.', 'Usage Error'))
        } else {
          await shopItemSchema.deleteMany({
            guildID: guild.id,
          });

          embed.setAuthor(
            `${member.user.username}`,
            member.user.displayAvatarURL()
          );
          embed.setColor('GREEN');
          embed.setDescription(
            `Successfully deleted all items in the ${guild.name} shop.`
          );
        }
      }
    }

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
