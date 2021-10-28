const infractionSchema = require('@schemas/infraction-sch');

module.exports = {
  name: 'unban',
  group: 'moderation',
  description: 'Unban a user.',
  format: '<userID>',
  global: true,
  permissions: ['BAN_MEMBERS'],
  options: [
    {
      name: 'user_id',
      description: 'Specify the ID of a user to unban.',
      type: 'STRING',
      required: true,
  ***REMOVED***
  ],
  async run(interaction) {
    const userID = interaction.options.getString('user_id');
    const guildBan = (await guild.bans.fetch()).get(userID);

    if (!guildBan) {
      interaction.reply({
        embeds: [
          util.embedify(
            'RED',
            interaction.guild.name,
            interaction.guild.iconURL(),
            `Could not find banned user with ID \`${userID}\`.`
          ),
        ],
      });

      return;
    }

    interaction.reply({
      embeds: [
        util.embedify(
          'GREEN',
          interaction.guild.name,
          interaction.guild.iconURL(),
          `Unbanned \`${userID}\`.`
        ),
      ],
    });

    interaction.guild.members.unban(userID);

    await infractionSchema.updateMany(
      {
        guildID: interaction.guild.id,
        userID,
        type: 'ban',
        active: true,
    ***REMOVED***
      {
        active: false,
      }
    );
***REMOVED***
};
