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
    const inventory = await inventorySchema.findOne({
      userID: user.id,
      guildID: guild.id,
    });

    let i = 0;
    let description = '';
    if (inventory) {
      for (const item of inventory.inventory) {
        i++;
        for (const prop in item) {
          description += `${prop}: ${item[prop]}\n`;
        }
        description += '\n';
      }
    }
    const inventoryEmbed = util.embedify(
      'BLURPLE',
      user.username,
      user.displayAvatarURL(),
      `\`${i}\` Items\n\`\`\`${description}\`\`\``
    );

    await interaction.reply({ embeds: [inventoryEmbed] });
***REMOVED***
};
