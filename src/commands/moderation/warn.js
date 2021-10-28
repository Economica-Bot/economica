module.exports = {
  name: 'warn',
  group: 'moderation',
  description: 'Warn a user.',
  format: '<user> [reason]',
  permissions: ['MUTE_MEMBERS'],
  global: true,
  options: [
    {
      name: 'user',
      description: 'Name a user you wish to warn.',
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

    if (targetMember.id === interaction.member.id) {
      embed = util.embedify(
        'RED',
        interaction.member.user.username,
        interaction.member.user.displayAvatarURL(),
        'You cannot warn yourself!'
      );
      ephemeral = true;
    } else {
      //Warn, record, and send message
      await targetMember
        .send({
          embeds: [
            util.embedify(
              'RED',
              interaction.guild.name,
              interaction.guild.iconURL(),
              `You have been **warned** for \`${reason}\`.`
            ),
          ],
        })
        .catch((err) => {
          result = `Could not dm ${targetMember.user.tag}.\n\`${err}\``;
        });

      embed = util.embedify(
        'GREEN',
        `Warned ${targetMember.user.tag}`,
        targetMember.user.displayAvatarURL(),
        `**Reason**: \`${reason}\``,
        result ? result : targetMember.id
      );

      await util.infraction(
        interaction.guild.id,
        targetMember.id,
        interaction.member.id,
        this.name,
        reason
      );
    }

    await interaction.reply({ embeds: [embed], ephemeral });
***REMOVED***
};
