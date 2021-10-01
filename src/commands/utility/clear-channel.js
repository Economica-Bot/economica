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
      name: 'msgcount',
      description: 'The count of messages to delete, between 0 and 100.',
      type: 4, //integer
      required: false,
  ***REMOVED***
  ],
  async run(interaction, guild, member, options) {
    let embed = null,
      msgCount = options._hoistedOptions?.[0]?.value ?? 100;
    if ((msgCount && msgCount > 100) || msgCount < 0) {
      embed = util.embedify(
        'RED',
        member.user.username,
        member.user.displayAvatarURL(),
        `Invalid Length: \`${msgCount}\` out of bounds.`
      );
    } else {
      const channel = await client.channels.fetch(interaction.channelId);

      await channel.bulkDelete(msgCount).then((val) => {
        embed = util.embedify(
          'GREEN',
          member.user.username,
          member.user.displayAvatarURL(),
          `Deleted \`${val.size}\` messages.`
        );
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
***REMOVED***
};
