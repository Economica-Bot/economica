module.exports = {
  name: 'kick',
  group: 'moderation',
  description: 'Kicks a user',
  global: true,
  permissions: ['KICK_MEMBERS'],
  options: [
    {
      name: 'user',
      description: 'Name a user you wish to kick.',
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
        'You cannot kick yourself!'
      );
      ephemeral = true;
    } else if (!targetMember.kickable) {
      embed = util.embedify(
        'RED',
        member.user.username,
        member.user.displayAvatarURL(),
        `<@!${targetMember.user.id}> is not kickable.`
      );
      ephemeral = true;
    } else {
      //Kick, record, and send message
      await targetMember
        .send({
          embeds: [
            util.embedify(
              'RED',
              guild.name,
              guild.iconURL(),
              `You have been **kicked** for \`${reason}\`.`
            ),
          ],
        })
        .catch((err) => {
          result = `Could not dm ${targetMember.user.tag}.\n\`${err}\``;
        });

      embed = util.embedify(
        'GREEN',
        `Kicked ${targetMember.user.tag}`,
        targetMember.user.displayAvatarURL(),
        `**Reason**: \`${reason}\``,
        result ? result : targetMember.user.id
      );

      targetMember.kick({
        reason,
      });

      await util.infraction(
        guild.id,
        targetMember.id,
        member.user.id,
        this.name,
        reason
      );
    }

    await interaction.reply({ embeds: [embed], ephemeral });
***REMOVED***
};
