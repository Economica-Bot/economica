const fs = require('fs');

const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
  name: 'module',
  group: 'config',
  untoggleable: true,
  description: 'Enable or disable a module.',
  global: true,
  permissions: ['ADMINISTRATOR'],
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
  async run(interaction, guild, author, options) {
    let color = 'GREEN',
      title = author.user.username,
      icon_url = author.user.displayAvatarURL(),
      description = '',
      footer = '',
      module,
      guildID = guild.id;
    const commandDirectories = fs.readdirSync('./commands');
    for (const commandDirectory of commandDirectories) {
      if (options._hoistedOptions[0].value === commandDirectory) {
        //Insert undisableable modules here:
        if (!['config', 'application', 'utility'].includes(commandDirectory)) {
          module = commandDirectory;
        }
        break;
      }
    }

    if (!module) {
      color = 'RED';
      description = `Command module \`${options._hoistedOptions[0].value}\` not found or cannot be toggled.`;
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
              disabled: options._subcommand === 'enable' ? false : true,
          ***REMOVED***
        ***REMOVED***
        }
      );

      description = `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
        1,
        options._subcommand.length
      )}d module \`${module}\``;
    }

    const embed = util.embedify(color, title, icon_url, description, footer);

    interaction.reply({ embeds: [embed] });
    return;
***REMOVED***
};
