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
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          description: 'Specify a channel.',
          type: 'CHANNEL',
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'remove',
      description: 'Remove the infraction log.',
      type: 'SUB_COMMAND',
      options: null,
  ***REMOVED***
  ],
  async run(interaction) {
    let color, description;
    if (interaction.options.getSubcommand() === 'set') {
      const channel = interaction.options.getChannel('channel');
      if (!channel.isText()) {
        color = 'RED';
        description = `\`${channel.name}\` is not a text channel.`;
      } else {
        await guildSettingSchema
          .findOneAndUpdate(
            {
              guildID: interaction.guild.id,
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
    } else if (interaction.options.getSubcommand() === 'remove') {
      await guildSettingSchema
        .findOneAndUpdate(
          {
            guildID: interaction.guild.id,
        ***REMOVED***
          {
            $unset: {
              infractionLogChannel: '',
          ***REMOVED***
          }
        )
        .then(() => {
          color = 'GREEN';
          description = `Removed infraction log.`;
        });
    }

    await interaction.reply({
      embeds: [
        util.embedify(
          color,
          interaction.guild.name,
          interaction.guild.iconURL(),
          description
        ),
      ],
    });
***REMOVED***
};
