const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
  name: 'currency',
  group: 'economy',
  description: 'View and update the currency symbol',
  global: true,
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'set',
      description: 'Set the currency symbol.',
      type: 1,
      options: [
        {
          name: 'symbol',
          description: 'Specify a symbol.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'reset',
      description: 'Reset the currency symbol.',
      type: 1,
      options: null,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    let color, description, footer;
    if (options._subcommand === 'set') {
      const currency = options._hoistedOptions[0].value;
      await guildSettingSchema
        .findOneAndUpdate(
          {
            guildID: guild.id,
        ***REMOVED***
          {
            currency,
        ***REMOVED***
          {
            upsert: true,
            new: true,
          }
        )
        .then(() => {
          color = 'GREEN';
          description = `Currency symbol set to ${currency}`;
          footer = currency;
        });
    } else if (options._subcommand === 'reset') {
      await guildSettingSchema
        .findOneAndUpdate(
          {
            guildID: guild.id,
        ***REMOVED***
          {
            $unset: {
              currency: '',
          ***REMOVED***
          }
        )
        .then(() => {
          (color = 'GREEN'), (description = 'Reset the currency symbol.');
        });
    }

    const embed = util.embedify(
      color,
      guild.name,
      guild.iconURL(),
      description,
      footer
    );

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
