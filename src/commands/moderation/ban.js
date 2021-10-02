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
  async run(interaction, guild, member, options) {
    const targetMember = options._hoistedOptions[0].member;
    let embed = (result = null),
      ephemeral = false,
      reason = options._hoistedOptions[1]?.value ?? 'No reason provided';

    if (targetMember.user.id === member.user.id) {
      embed = util.embedify(
        'RED',
        member.user.username,
        member.user.displayAvatarURL(),
        'You cannot ban yourself!'
      );
      ephemeral = true;
    } else if (!targetMember.bannable) {
      embed = util.embedify(
        'RED',
        member.user.username,
        member.user.displayAvatarURL(),
        `<@!${targetMember.user.id}> is not bannable.`
      );
      ephemeral = true;
    } else {
      //Ban, record, and send message
      await targetMember
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
          result = `Could not dm ${targetMember.user.tag}.\n\`${err}\``;
        });

      embed = util.embedify(
        'GREEN',
        `Banned ${targetMember.user.tag}`,
        targetMember.user.displayAvatarURL(),
        `**Reason**: \`${reason}\``,
        result ? result : targetMember.user.id
      );

      targetMember.ban({
        reason,
      });

      await util.infraction(
        guild.id,
        targetMember.id,
        member.user.id,
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
