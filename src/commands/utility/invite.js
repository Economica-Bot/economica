module.exports = {
  name: 'invite',
  group: 'utility',
  description: 'Gets the invite link for Economica.',
  options: null,
  async run(interaction) {
    interaction.reply({
      embeds: [
        util.embedify(
          'GOLD',
          client.user.username,
          client.user.displayAvatarURL(),
          `Invite link: __Public Soon__`
        ),
      ],
    });
***REMOVED***
};
