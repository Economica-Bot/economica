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
      type: 7, //channel
      required: false,
  ***REMOVED***
    {
      name: 'msgcount',
      description: 'The count of messages to delete, between 0 and 100.',
      type: 4, //integer
      required: false,
  ***REMOVED***
  ],
  async run(interaction, guild, member, options) {
    console.log(options);
    let embed = null,
      channelID,
      msgCount;
    for (const option of options._hoistedOptions) {
      if (option.channel) {
        channelID = option.channel.id;
      } else if (option.name === 'msgcount') msgCount = option.value;
    }
    msgCount = msgCount ?? 100;
    if ((msgCount && msgCount > 100) || msgCount < 0) {
      embed = util.embedify(
        'RED',
        member.user.username,
        member.user.displayAvatarURL(),
        `Invalid Length: \`${msgCount}\` out of bounds.`
      );
    } else {
      const channel = await guild.channels.fetch(
        channelID || interaction.channelId
      );

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
