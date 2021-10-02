module.exports = {
  name: 'ping',
  group: 'utility',
  description: 'ping',
  options: null,
  global: true,
  async run(interaction, guild, member) {
    await interaction.reply({
      embeds: [
        util.embedify(
          'GREEN',
          member.user.username,
          member.user.displayAvatarURL(),
          `Pong! \`${client.ws.ping}ms\``
        ),
      ],
    });
***REMOVED***
};
