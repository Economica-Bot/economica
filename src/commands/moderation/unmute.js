const infractionSchema = require('@schemas/infraction-sch');

module.exports = {
  name: 'unmute',
  group: 'moderation',
  description: 'Unmute a user.',
  format: '<user>',
  global: true,
  permissions: ['MUTE_MEMBERS'],
  roles: [
    {
      name: 'MUTED',
      required: false,
  ***REMOVED***
  ],
  options: [
    {
      name: 'user',
      description: 'Specify a user to unmute.',
      type: 6,
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const member = options._hoistedOptions[0].member;

    //Remove muted role
    const mutedRole = guild.roles.cache.find((role) => {
      return role.name.toLowerCase() === 'muted';
    });

    member.roles.remove(mutedRole);

    //Check if there is an active mute
    const activeMutes = await infractionSchema.find({
      userID: member.id,
      guildID: guild.id,
      type: 'mute',
      active: true,
    });

    if (!activeMutes.length) {
      interaction.reply({
        embeds: [
          util.embedify(
            'RED',
            member.user.tag,
            member.user.displayAvatarURL(),
            `Could not find any active mutes for this user.`,
            member.user.id
          ),
        ],
      });

      return;
    }

    interaction.reply({
      embeds: [
        util.embedify(
          'GREEN',
          guild.name,
          guild.iconURL(),
          `Unmuted <@!${member.user.id}>`
        ),
      ],
    });

    await infractionSchema.updateMany(
      {
        userID: member.id,
        guildID: guild.id,
        type: 'mute',
        active: true,
    ***REMOVED***
      {
        active: false,
      }
    );
***REMOVED***
};
