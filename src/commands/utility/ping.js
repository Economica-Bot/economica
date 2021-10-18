module.exports = {
  name: 'ping',
  group: 'utility',
  description: 'ping',
  options: null,
  global: true,
  async run(interaction) {
    await interaction.reply({
      embeds: [
        util.embedify(
          'GREEN',
          interaction.member.user.username,
          interaction.member.user.displayAvatarURL(),
          `Pong! \`${client.ws.ping}ms\``
        ),
      ],
    });
***REMOVED***
};
