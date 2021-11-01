module.exports = {
  name: 'invite',
  group: 'utility',
  description: 'Gets the invite link for Economica.',
  options: null,
  async run(interaction) {
    await interaction.reply({
      embeds: [
        util.embedify(
          'GOLD',
          client.user.username,
          client.user.displayAvatarURL(),
          `Invite link: __[Click Here](${process.env.INVITE_LINK} 'Invite Economica')__`
        ),
      ],
    });
***REMOVED***
};
