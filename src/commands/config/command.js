const fs = require('fs');

const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
  name: 'command',
  group: 'config',
  untoggleable: true,
  description: 'Enable or disable a command.',
  global: true,
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'enable',
      description: 'Enable a command.',
      type: 1,
      options: [
        {
          name: 'command',
          description: 'Specify a command.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'disable',
      description: 'Disable a command.',
      type: 1,
      options: [
        {
          name: 'command',
          description: 'Specify a command.',
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
      cmd,
      guildID = guild.id;
    const commandDirectories = fs.readdirSync('./commands');
    for (const commandDirectory of commandDirectories) {
      const commandFiles = fs
        .readdirSync(`./commands/${commandDirectory}/`)
        .filter((file) => file.endsWith('js'));
      for (const commandFile of commandFiles) {
        const command = require(`../../commands/${commandDirectory}/${commandFile}`);
        if (options._hoistedOptions[0].value === command.name) {
          if(!command.untoggleable) {
            cmd = command.name;
          }
          break;
        }
      }
    }

    if (!cmd) {
      color = 'RED';
      description = `Command \`${options._hoistedOptions[0].value}\` not found or cannot be toggled.`;
      footer = 'Use help for a list of commands.';
    } else {
      await guildSettingSchema.findOneAndUpdate(
        {
          guildID,
      ***REMOVED***
        {
          $pull: {
            commands: {
              command: cmd,
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***
        {
          new: true,
          upsert: true,
        }
      );
      await guildSettingSchema.findOneAndUpdate(
        {
          guildID,
      ***REMOVED***
        {
          $push: {
            commands: {
              command: cmd,
              enabled: options._subcommand === 'enable' ? true : false,
          ***REMOVED***
        ***REMOVED***
        }
      );

      description = `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
        1,
        options._subcommand.length
      )}d command \`${cmd}\``;
    }

    const embed = util.embedify(color, title, icon_url, description, footer);

    interaction.reply({ embeds: [embed], ephemeral: true });
    return;
***REMOVED***
};
