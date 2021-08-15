const inventorySchema = require('@schemas/inventory-sch');

module.exports = {
  name: 'inventory',
  group: 'market',
  description: 'View an inventory.',
  format: '[user]',
  global: true,
  options: [
    {
      name: 'user',
      description: 'Name a user you wish to see the inventory of.',
      type: 6,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const user = options._hoistedOptions?.[0]?.user ?? author.user;

    const currencySymbol = await util.getCurrencySymbol(guild.id);
    const inventory = await inventorySchema.findOne({
      userID: user.id,
      guildID: guild.id,
    });

    const inventoryEmbed = util.embedify(
      'BLURPLE',
      user.username,
      user.displayAvatarURL()
    );

    let i = 0;
    if (inventory) {
      for (const item of inventory.inventory) {
        i++;
        inventoryEmbed.addField(
          `${currencySymbol}${item.price.toLocaleString()} | \`${item.item}\``,
          `${item.description}`
        );
      }
    }

    inventoryEmbed.setDescription(`\`${i}\` Items`);

    await interaction.reply({ embeds: [inventoryEmbed] });
***REMOVED***
};
