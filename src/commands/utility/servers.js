module.exports = {
  name: 'servers',
  group: 'utility',
  description: `Get information about ${client.user.tag}'s servers`,
  global: true,
  commandOptions: null,
  async run(interaction, guild, author, options) {
    let serverCount = 0,
      memberCount = 0,
      description = '';
    client.guilds.cache.forEach((guild) => {
      serverCount++;
      memberCount += guild.memberCount;
      description += `**${guild}** | \`${guild.memberCount.toLocaleString()}\` Members\n`;
    });

    const embed = util.embedify(
      'GREEN',
      'Server List',
      client.user.displayAvatarURL(),
      description
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
***REMOVED***
};
