module.exports = {
  name: 'clear',
  group: 'utility',
  format: '[msgcount]',
  description:
    'Deletes a number of messages in a channel. If not specified, deletes all messages <= 2 weeks old.',
  global: true,
  permissions: ['MANAGE_MESSAGES'],
  options: [
    {
      name: 'channel',
      description: 'Select a channel.',
      type: 'CHANNEL',
      required: false,
  ***REMOVED***
    {
      name: 'msgcount',
      description: 'The count of messages to delete, between 0 and 100.',
      type: 'NUMBER',
      required: false,
  ***REMOVED***
  ],
  async run(interaction) {
    const channel =
      interaction.options.getChannel('channel') ?? interaction.channel;
    const msgCount = interaction.options.getNumber('msgCount') ?? 100;
    if (msgCount > 100 || msgCount < 0) {
      await interaction.reply({
        embeds: [
          util.embedify(
            'RED',
            interaction.member.user.username,
            interaction.member.user.displayAvatarURL(),
            `Invalid Length: \`${msgCount}\` out of bounds.`
          ),
        ],
        ephemeral: true,
      });
    } else {
      await channel.bulkDelete(msgCount, true).then(async (val) => {
        await interaction.reply({
          embeds: [
            util.embedify(
              'GREEN',
              interaction.member.user.username,
              interaction.member.user.displayAvatarURL(),
              `Deleted \`${val.size}\` messages.`
            ),
          ],
          ephemeral: true,
        });
      });
    }
***REMOVED***
};
