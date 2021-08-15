const { income } = require('../../config.json');

module.exports = {
  name: 'income',
  group: 'income',
  description: 'View all income commands and their settings.',
  global: true,
  options: null,
  async run(interaction, guild, author, options) {
    const incomeEmbed = util.embedify(
      'BLURPLE',
      `${guild.name}'s Income Commands`,
      guild.iconURL(),
      'Use `setincome <cmd>` to configure income commands.'
    );

    for (const command in income) {
      let properties = await util.getCommandStats(guild.id, command);
      let description = '```';
      for (const property in properties) {
        description += `${property}: ${properties[property]}\n`;
      }

      incomeEmbed.addField(`__${command}__`, `${description}\`\`\``, true);
    }

    await interaction.reply({ embeds: [incomeEmbed] });
***REMOVED***
};
