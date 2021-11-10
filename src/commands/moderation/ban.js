module.exports = {
  name: 'ban',
  group: 'moderation',
  description: 'Ban a user.',
  format: '<user> [reason]',
  global: true,
  permissions: ['BAN_MEMBERS'],
  clientPermissions: ['BAN_MEMBERS'],
  options: [
    {
      name: 'user',
      description: 'Specify a user.',
      type: 'USER',
      required: true,
  ***REMOVED***
    {
      name: 'reason',
      description: 'Provide a reason.',
      type: 'STRING',
  ***REMOVED***
  ],
  async run(interaction) {
    const targetMember = interaction.options.getMember('user');
    let embed = (result = null),
      ephemeral = false,
      reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (targetMember.user.id === interaction.member.user.id) {
      embed = util.embedify(
        'RED',
        interaction.member.user.tag,
        interaction.member.user.displayAvatarURL(),
        'You cannot ban yourself!'
      );
      ephemeral = true;
    } else if (!targetMember.bannable) {
      embed = util.embedify(
        'RED',
        interaction.member.user.tag,
        interaction.member.user.displayAvatarURL(),
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
              interaction.guild.name,
              interaction.guild.iconURL(),
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
        interaction.guild.id,
        targetMember.id,
        interaction.member.user.id,
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
