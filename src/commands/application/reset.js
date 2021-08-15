module.exports = {
  name: 'reset',
  group: 'application',
  description: 'Resets all slash commands.',
  global: true,
  options: null,
  ownerOnly: true,
  async run(interaction, guild, author, options) {
    // client.guilds.cache.forEach(async guild => {
    //     guild.commands.set([])
    // })

    // await client.commands.set([])

    //Only economica server + globals
    guild.commands.set([]);
    client.commands.set([]);

    embed = util.embedify(
      'GREEN',
      author.user.username,
      author.user.displayAvatarURL(),
      '`RESET ALL SLASH COMMANDS`'
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
***REMOVED***
};
