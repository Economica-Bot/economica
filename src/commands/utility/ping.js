module.exports = {
  name: 'ping',
  group: 'utility',
  description: 'ping',
  options: null,
  global: true,
  async run(interaction, guild, author, options) {
    await interaction.reply({
      embeds: [
        util.embedify(
          'GREEN',
          author.user.username,
          author.user.displayAvatarURL(),
          `Pong! \`${client.ws.ping}ms\``
        ),
      ],
    });
***REMOVED***
};
