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
        {
          name: 'channel',
          description: 'Specify a channel.',
          type: 'CHANNEL',
          required: false,
      ***REMOVED***
        {
          name: 'role',
          description: 'Specify a role.',
          type: 'ROLE',
          required: false,
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
        {
          name: 'channel',
          description: 'Specify a channel.',
          type: 'CHANNEL',
          required: false,
      ***REMOVED***
        {
          name: 'role',
          description: 'Specify a role.',
          type: 'ROLE',
          required: false,
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
          if (!command.untoggleable) {
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
      const guildSettings = await guildSettingSchema.findOneAndUpdate(
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
          upsert: true,
        }
      );

      const commandSettings = guildSettings.commands.find(
        (c) => c.command === cmd
      ) ?? {
        command: cmd,
      };

      let channel, role;
      options._hoistedOptions.forEach((option) => {
        if (option.channel) {
          channel = option.channel;
        } else if (option.role) {
          role = option.role;
        }
      });

      //Enable or disable a channel for a command
      if (channel) {
        if (!channel.isText()) {
          color = 'RED';
          description += `\`${channel.name}\` is not a text channel.\n`;
        } else {
          if (!commandSettings.channels) {
            commandSettings.channels = [];
          }
          if (commandSettings.channels.find((c) => c.channel === channel.id)) {
            commandSettings.channels.find((c) => c.channel === channel.id).disabled =
              options._subcommand === 'disable' ? true : false;
          } else {
            commandSettings.channels.push({
              channel: channel.id,
              disabled: options._subcommand === 'disable' ? true : false,
            });
          }
          description += `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
            1,
            options._subcommand.length
          )}d command \`${cmd}\` in <#${channel.id}>\n`;
        }
      }

      //Enable or disable a role for a command
      if (role) {
        if (!commandSettings.roles) {
          commandSettings.roles = [];
        }
        if (commandSettings.roles.find((r) => r.role === role.id)) {
          commandSettings.roles.find((r) => r.role === role.id).disabled =
            options._subcommand === 'disable' ? true : false;
        } else {
          commandSettings.roles.push({
            role: role.id,
            disabled: options._subcommand === 'disable' ? true : false,
          });
        }
        description += `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
          1,
          options._subcommand.length
        )}d command \`${cmd}\` for <@&${role.id}>\n`;
      }

      //Enable or disable a command
      if (!role && !channel) {
        commandSettings.disabled =
          options._subcommand === 'disable' ? true : false;
        description += `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
          1,
          options._subcommand.length
        )}d command \`${cmd}\``;
      }

      await guildSettingSchema.findOneAndUpdate(
        { guildID },
        {
          $push: {
            commands: {
              ...commandSettings,
          ***REMOVED***
        ***REMOVED***
        }
      );
    }

    const embed = util.embedify(color, title, icon_url, description, footer);

    interaction.reply({ embeds: [embed] });
    return;
***REMOVED***
};
