const infractionSchema = require('@schemas/infraction-sch');

module.exports = {
  name: 'infractions',
  group: 'moderation',
  description: "Display information about a user's infractions.",
  format: '<user>',
  permissions: ['MUTE_MEMBERS'],
  global: true,
  options: [
    {
      name: 'user',
      description: 'Specify a user.',
      type: 6, //USER
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    await interaction.deferReply();

    const member = options._hoistedOptions[0].member;

    //find latest infraction data
    const infractions = await infractionSchema
      .find({
        guildID: guild.id,
        userID: member.user.id,
      })
      .sort({
        createdAt: -1,
      });

    let infractionEmbed = util.embedify(
      'BLURPLE',
      `${member.user.tag}'s Infractions`,
      member.user.displayAvatarURL(),
      '',
      `Server Member | Joined ${new Date(
        member.joinedTimestamp
      ).toLocaleString()}`
    );

    const row = new Discord.MessageActionRow();
    const infractionTypes = [
      {
        type: 'warn',
        formal: 'Warned',
        logo: 'Warns ⚠️',
        had: false,
    ***REMOVED***
      {
        type: 'mute',
        formal: 'Muted',
        logo: 'Mutes 🎤',
        had: false,
    ***REMOVED***
      {
        type: 'kick',
        formal: 'Kicked',
        logo: 'Kicks 👢',
        had: false,
    ***REMOVED***
      {
        type: 'ban',
        formal: 'Banned',
        logo: 'Bans 🔨',
        had: false,
    ***REMOVED***
    ];

    for (const infraction of infractions) {
      if (infraction.type === 'warn') {
        const warn = infractionTypes.find((obj) => obj.type === 'warn');
        warn.had = true;
      } else if (infraction.type === 'mute') {
        const mute = infractionTypes.find((obj) => obj.type === 'mute');
        mute.had = true;
        if (infraction.active) {
          infractionEmbed.addField(
            `Currently **Muted**`,
            `\`${infraction.reason}\``
          );
        }
      } else if (infraction.type === 'kick') {
        const kick = infractionTypes.find((obj) => obj.type === 'kick');
        kick.had = true;
      } else if (infraction.type === 'ban') {
        const ban = infractionTypes.find((obj) => obj.type === 'ban');
        ban.had = true;
        if (infraction.active) {
          infractionEmbed.addField(
            `Currently **Banned**`,
            `\`${infraction.reason}\``
          );
        }
      }
    }

    let description = '';
    for (const infractionType of infractionTypes) {
      description += `**${infractionType.formal}** \`${
        infractions.filter(
          (infraction) => infraction.type === infractionType.type
        ).length
      }\` times\n`;
      row.addComponents(
        new Discord.MessageButton()
          .setCustomId(`${infractionType.type}`)
          .setLabel(`${infractionType.logo}`)
          .setStyle(4)
          .setDisabled(!infractionType.had)
      );
    }

    infractionEmbed.setDescription(description);

    const msg = await interaction.editReply({
      embeds: [infractionEmbed],
      components: [row],
    });

    client.on('interactionCreate', async (interaction) => {
      if (
        interaction.isButton() &&
        interaction.message.id === msg.id &&
        interaction.user.id === author.user.id
      ) {
        let title = '',
          description = '';
        infractions.forEach((infraction) => {
          if (infraction.type === interaction.customId) {
            const infractionType = infractionTypes.filter(
              (infractionType) => infractionType.type === infraction.type
            )[0];
            title = infractionType.logo;
            description += `${infractionType.formal} by <@!${
              infraction.staffID
            }> for \`${infraction.reason}\` ${
              infraction.type === 'mute'
                ? `${
                    infraction.permanent
                      ? '| **Permanent**'
                      : `until **${infraction.expires.toLocaleString()}**`
                  }`
                : ''
            }\n`;
          }
        });

        const specEmbed = util.embedify(
          'BLURPLE',
          `${member.user.tag} | ${title}`,
          member.user.displayAvatarURL(),
          description
        );

        await interaction.update({
          embeds: [specEmbed],
        });
      }
    });
***REMOVED***
};
