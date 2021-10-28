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
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'symbol',
          description: 'Specify a symbol.',
          type: 'STRING',
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'reset',
      description: 'Reset the currency symbol.',
      type: 'SUB_COMMAND',
      options: null,
  ***REMOVED***
  ],
  async run(interaction) {
    let color, description, footer;
    if (interaction.options.getSubcommand() === 'set') {
      const currency = interaction.options.getString('symbol');
      await guildSettingSchema
        .findOneAndUpdate(
          {
            guildID: interaction.guild.id,
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
    } else if (interaction.options.getSubcommand() === 'reset') {
      await guildSettingSchema
        .findOneAndUpdate(
          {
            guildID: interaction.guild.id,
        ***REMOVED***
          {
            $unset: {
              currency: '',
          ***REMOVED***
          }
        )
        .then(() => {
          color = 'GREEN';
          description = 'Reset the currency symbol.';
        });
    }

    const embed = util.embedify(
      color,
      interaction.guild.name,
      interaction.guild.iconURL(),
      description,
      footer
    );

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
