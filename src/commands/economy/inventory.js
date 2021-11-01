const inventorySchema = require('@schemas/inventory-sch');

module.exports = {
  name: 'inventory',
  group: 'economy',
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
    await interaction.deferReply();

    const user = interaction.options.getUser('user') ?? interaction.member.user;
    const inventory = await inventorySchema.findOne({
      userID: user.id,
      guildID: interaction.guild.id,
    });

    const embeds = [];

    let entries = 15;
    let pageCount = Math.ceil(inventory.inventory.length / entries);

    const inventoryEntries = [];
    inventory.inventory.forEach((item) => {
      let itemDescription = '';
      for (prop in item) {
        itemDescription += `**${prop}**: \`${item[prop]}\`\n`;
      }
      inventoryEntries.push(`${itemDescription}\n`);
    });

    let k = 0;
    for (let i = 0; i < pageCount; i++) {
      description = '';
      for (let j = 0; j < entries; j++) {
        if (inventoryEntries[k]) {
          description += inventoryEntries[k++];
        }
      }
      embeds.push(
        new Discord.MessageEmbed()
          .setAuthor(
            `${interaction.member.user.tag}`,
            interaction.member.user.displayAvatarURL()
          )
          .setColor('BLUE')
          .setDescription(description)
      );
    }

    await util.paginate(interaction, embeds);
***REMOVED***
};
