const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
  name: 'infraction-log',
  group: 'moderation',
  description: 'Manage the infraction logging channel.',
  format: '<set | remove> [channel]',
  global: true,
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'set',
      description: 'Set the infraction log.',
      type: 1,
      options: [
        {
          name: 'channel',
          description: 'Specify a channel.',
          type: 7,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'remove',
      description: 'Remove the infraction log.',
      type: 1,
      options: null,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    let color, description;
    if (options._subcommand === 'set') {
      const channel = options._hoistedOptions[0].channel;
      if (channel.type !== 'GUILD_TEXT') {
        color = 'RED';
        description = `\`${channel.name}\` is not a text channel.`;
      } else {
        await guildSettingSchema
          .findOneAndUpdate(
            {
              guildID: guild.id,
          ***REMOVED***
            {
              infractionLogChannel: channel.id,
          ***REMOVED***
            {
              upsert: true,
              new: true,
            }
          )
          .then(() => {
            color = 'GREEN';
            description = `Infraction log set to <#${channel.id}>`;
          });
      }
    } else if (options._subcommand === 'remove') {
      await guildSettingSchema
        .findOneAndUpdate(
          {
            guildID: guild.id,
        ***REMOVED***
          {
            $unset: {
              infractionLogChannel: '',
          ***REMOVED***
          }
        )
        .then(() => {
          (color = 'GREEN'), (description = `Removed infraction log.`);
        });
    }

    const embed = util.embedify(
      color,
      guild.name,
      guild.iconURL(),
      description
    );

    interaction.reply({ embeds: [embed] });
***REMOVED***
};