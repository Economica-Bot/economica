module.exports = {
  name: 'ban',
  group: 'moderation',
  description: 'Ban a user.',
  format: '<user> [reason]',
  global: true,
  permissions: ['BAN_MEMBERS'],
  options: [
    {
      name: 'user',
      description: 'Specify a user.',
      type: 6,
      required: true,
  ***REMOVED***
    {
      name: 'reason',
      description: 'Provide a reason.',
      type: 3,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const member = options._hoistedOptions[0].member;
    let embed = (result = null),
      ephemeral = false,
      reason = options._hoistedOptions[1]?.value ?? 'No reason provided';

    if (member.user.id === author.user.id) {
      embed = util.embedify(
        'RED',
        author.user.username,
        author.user.displayAvatarURL(),
        'You cannot ban yourself!'
      );
      ephemeral = true;
    } else if (!member.bannable) {
      embed = util.embedify(
        'RED',
        author.user.username,
        author.user.displayAvatarURL(),
        `<@!${member.user.id}> is not bannable.`
      );
      ephemeral = true;
    } else {
      //Ban, record, and send message
      await member
        .send({
          embeds: [
            util.embedify(
              'RED',
              guild.name,
              guild.iconURL(),
              `You have been **banned** for \`${reason}\`.`
            ),
          ],
        })
        .catch((err) => {
          result = `Could not dm ${member.user.tag}.\n\`${err}\``;
        });

      embed = util.embedify(
        'GREEN',
        `Banned ${member.user.tag}`,
        member.user.displayAvatarURL(),
        `**Reason**: \`${reason}\``,
        result ? result : member.user.id
      );

      member.ban({
        reason,
      });

      await util.infraction(
        guild.id,
        member.id,
        author.user.id,
        this.name,
        reason,
        true
      );
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral,
    });
***REMOVED***
};
