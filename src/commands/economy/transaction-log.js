const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
  name: 'transaction-log',
  group: 'economy',
  description: 'Manage the transaction logging channel.',
  format: '<set | remove> [channel]',
  global: true,
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'set',
      description: 'Set the transaction log.',
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
      description: 'Remove the transaction log.',
      type: 1,
      options: null,
  ***REMOVED***
  ],
  async run(interaction, guild, member, options) {
    let color, description;
    if (options._subcommand === 'set') {
      const channel = options._hoistedOptions[0].channel;
      if (!channel.isText()) {
        color = 'RED';
        description = `\`${channel.name}\` is not a text channel.`;
      } else {
        await guildSettingSchema
          .findOneAndUpdate(
            {
              guildID: guild.id,
          ***REMOVED***
            {
              transactionLogChannel: channel.id,
          ***REMOVED***
            {
              upsert: true,
              new: true,
            }
          )
          .then(() => {
            color = 'GREEN';
            description = `Transaction log set to <#${channel.id}>`;
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
              transactionLogChannel: '',
          ***REMOVED***
          }
        )
        .then(() => {
          color = 'GREEN';
          description = `Removed transaction log.`;
        });
    }

    const embed = util.embedify(
      color,
      guild.name,
      guild.iconURL(),
      description
    );

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
