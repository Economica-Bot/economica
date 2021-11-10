const infractionSchema = require('@schemas/infraction-sch');

const { isValidObjectId } = require('mongoose');

module.exports = {
  name: 'infractions',
  group: 'moderation',
  description: "Display information about a user's infractions.",
  format: '<user>',
  global: true,
  options: [
    {
      name: 'view',
      description: 'View infractions.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'user',
          description: 'Specify a user.',
          type: 'USER',
          required: true,
      ***REMOVED***
        {
          name: 'infraction_id',
          description: 'Specify an infraction.',
          type: 'STRING',
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'delete',
      description: 'Delete infractions.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'user',
          description: 'Specify a user.',
          type: 'USER',
          required: true,
      ***REMOVED***
        {
          name: 'infraction_id',
          description: 'Specify an infraction.',
          type: 'STRING',
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction) {
    await interaction.deferReply();

    const targetMember = interaction.options.getMember('user');
    const _id = interaction.options.getString('infraction_id');
    if (!isValidObjectId(_id)) {
      interaction.editReply({
        embeds: [
          util.embedify(
            'RED',
            interaction.member.user.tag,
            interaction.member.user.displayAvatarURL(),
            `Invalid loan ID: \`${_id}\``
          ),
        ],
      });
      return;
    }

    //View infractions
    if (interaction.options.getSubcommand('view')) {
      //find latest infraction data
      const infractions = await infractionSchema
        .find({
          guildID: interaction.guild.id,
          userID: targetMember.user.id,
        })
        .sort({
          createdAt: -1,
        });

      //Array of format objects
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

      let infractionEmbed = util.embedify(
        'BLURPLE',
        `${targetMember.user.tag}'s Infractions`,
        targetMember.user.displayAvatarURL(),
        '',
        `Server Member | Joined ${new Date(
          targetMember.joinedTimestamp
        ).toLocaleString()}`
      );

      //View single infraction
      if (_id) {
        const infraction = await infractionSchema.findOne({ _id });
        if (infraction) {
          infractionEmbed.description = `Infraction \`${_id}\`\n${
            infractionTypes.find((inf) => inf.type === infraction.type).formal
          } by <@!${infraction.staffID}> for \`${infraction.reason}\` ${
            infraction.type === 'mute'
              ? `${
                  infraction.permanent
                    ? '| **Permanent**'
                    : `until **${infraction.expires.toLocaleString()}**`
                }`
              : ''
          }\n`;
        } else {
          infractionEmbed.description = `Could not find infraction \`${_id}\``;
        }

        await interaction.editReply({ embeds: [infractionEmbed] });
      }

      //View all infractions
      else {
        const row = new Discord.MessageActionRow();

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
            interaction.user.id === interaction.user.id
          ) {
            let title = '',
              description = '';
            infractions.forEach((infraction) => {
              if (infraction.type === interaction.customId) {
                const infractionType = infractionTypes.filter(
                  (infractionType) => infractionType.type === infraction.type
                )[0];
                title = infractionType.logo;
                description += `Infraction \`${infraction._id}\`\n${
                  infractionType.formal
                } by <@!${infraction.staffID}> for \`${infraction.reason}\` ${
                  infraction.type === 'mute'
                    ? `${
                        infraction.permanent
                          ? '| **Permanent**'
                          : `until **${infraction.expires.toLocaleString()}**`
                      }`
                    : ''
                }\n\n`;
              }
            });

            const specEmbed = util.embedify(
              'BLURPLE',
              `${targetMember.user.tag} | ${title}`,
              targetMember.user.displayAvatarURL(),
              description
            );

            await interaction.update({
              embeds: [specEmbed],
            });
          }
        });
      }
    }

    //Delete infractions
    else {
      let description,
        color = 'GREEN';

      //Delete single infraction
      if (_id) {
        const infraction = await infractionSchema.findOneAndDelete({
          _id,
        });
        if (infraction) {
          description = `Deleted infraction \`${infraction._id}\``;
        } else {
          description = `Could not find infraction \`${_id}\``;
        }
      }

      //Delete all infractions
      else {
        const infractions = await infractionSchema.deleteMany({
          guildID: interaction.guild.id,
          userID: targetMember.user.id,
        });

        description = `Deleted \`${infractions.n}\` infractions.`;
      }

      await interaction.editReply({
        embeds: [
          util.embedify(
            color,
            interaction.member.user.tag,
            interaction.member.user.displayAvatarURL(),
            description
          ),
        ],
      });
    }
***REMOVED***
};
