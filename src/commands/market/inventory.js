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
      type: 'USER',
  ***REMOVED***
  ],
  async run(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.member.user;
    const inventory = await inventorySchema.findOne({
      userID: user.id,
      guildID: interaction.guild.id,
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

    await interaction.reply({
      embeds: [
        util.embedify(
          'BLURPLE',
          user.username,
          user.displayAvatarURL(),
          `\`${i}\` Items\n${
            description.length ? `\`\`\`${description}\`\`\`` : ''
          }`
        ),
      ],
    });
***REMOVED***
};
