const fs = require('fs');
const path = require('path');

const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
  name: 'module',
  group: 'config',
  untoggleable: true,
  description: 'Enable or disable a module.',
  global: true,
  permissions: ['MANAGE_GUILD'],
  options: [
    {
      name: 'enable',
      description: 'Enable a module.',
      type: 1,
      options: [
        {
          name: 'module',
          description: 'Specify a module.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'disable',
      description: 'Disable a module.',
      type: 1,
      options: [
        {
          name: 'module',
          description: 'Specify a module.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction) {
    let color = 'GREEN',
      title = interaction.member.user.tag,
      icon_url = interaction.member.user.displayAvatarURL(),
      description = '',
      footer = '',
      module,
      guildID = interaction.guild.id;
    const commandDirectories = fs.readdirSync(path.join(__dirname, '/../'));

    for (const commandDirectory of commandDirectories) {
      if (interaction.options.getString('module') === commandDirectory) {
        //Insert undisableable modules here:
        if (!['config', 'application', 'utility'].includes(commandDirectory)) {
          module = commandDirectory;
        }
        break;
      }
    }

    if (!module) {
      color = 'RED';
      description = `Command module \`${interaction.options.getString(
        'module'
      )}\` not found or cannot be toggled.`;
      footer = 'Use help for a list of command modules.';
    } else {
      await guildSettingSchema.findOneAndUpdate(
        { guildID },
        {
          $pull: {
            modules: {
              module: module,
          ***REMOVED***
        ***REMOVED***
        }
      );
      await guildSettingSchema.findOneAndUpdate(
        { guildID },
        {
          $push: {
            modules: {
              module: module,
              disabled:
                interaction.options.getSubcommand() === 'enable' ? false : true,
          ***REMOVED***
        ***REMOVED***
        }
      );

      description = `${interaction.options
        .getSubcommand()
        .toUpperCase()}D module \`${module}\``;
    }

    const embed = util.embedify(color, title, icon_url, description, footer);

    interaction.reply({ embeds: [embed] });
    return;
***REMOVED***
};
