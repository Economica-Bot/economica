const fs = require('fs');
const ms = require('ms');
const guildSettingSchema = require('@schemas/guild-settings-sch');
const incomeSchema = require('@schemas/income-sch');

module.exports = {
  name: 'command',
  group: 'config',
  untoggleable: true,
  description: 'Manage commands.',
  global: true,
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'permission',
      description: 'Manage command permissions.',
      type: 2,
      options: [
        {
          name: 'view', 
          description: "View a command's permissions.", 
          type: 1, 
          options: [
            {
              name: 'command', 
              description: 'Specify a command.', 
              type: 3, 
              required: true
          ***REMOVED***  
          ],
      ***REMOVED***
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
            {
              name: 'cooldown',
              description: 'Specify a cooldown.',
              type: 3,
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
            {
              name: 'cooldown',
              description: 'Specify a cooldown.',
              type: 3,
              required: false,
          ***REMOVED***
          ],
      ***REMOVED***
        {
          name: 'reset',
          description: 'Reset a command.',
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
  ***REMOVED***
    {
      name: 'config',
      description: 'Configure a command.',
      type: 2,
      options: [
        //module
        {
          name: 'income_command',
          description: 'Configure an income command.',
          type: 1,
          options: [
            {
              name: 'command',
              description: 'Specify an income command.',
              type: 3,
              required: true,
          ***REMOVED***
            {
              name: 'min',
              description: 'Specify the minimum income for this command.',
              type: 4,
          ***REMOVED***
            {
              name: 'max',
              description: 'Specify the maximum income for this command.',
              type: 4,
          ***REMOVED***
            {
              name: 'chance',
              description: 'Specify the chance for this command.',
              type: 3,
          ***REMOVED***
            {
              name: 'minfine',
              description: 'Specify the minimum fine for this command.',
              type: 4,
          ***REMOVED***
            {
              name: 'maxfine',
              description: 'Specify the maximum fine for this command.',
              type: 4,
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction, guild, member, options) {
    let color = 'GREEN',
      title = member.user.username,
      icon_url = guild.iconURL(),
      description = '',
      footer = '',
      guildID = guild.id;
    let cmd;

    const commandDirectories = fs.readdirSync('./commands');
    for (const commandDirectory of commandDirectories) {
      const commandFiles = fs
        .readdirSync(`./commands/${commandDirectory}/`)
        .filter((file) => file.endsWith('js'));
      for (const commandFile of commandFiles) {
        const command = require(`../../commands/${commandDirectory}/${commandFile}`);
        if (options._hoistedOptions[0].value === command.name) {
          cmd = command;
        }
      }
    }

    if (
      !cmd ||
      cmd?.untoggleable ||
      (options._subcommand === 'income_command' && cmd.group !== 'income')
    ) {
      color = 'RED';
      description = `Command \`${options._hoistedOptions[0].value}\` is not found or cannot be toggled`;
      footer = 'Use help for a list of commands.';
    } else if (options._group === 'permission') {
      const guildSettings = await guildSettingSchema.findOneAndUpdate(
        {
          guildID,
      ***REMOVED***
        {
          $pull: {
            commands: {
              command: cmd.name,
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***
        {
          upsert: true,
        }
      );

      let commandSettings = guildSettings.commands.find(
        (c) => {
          return c.command === cmd.name
        } 
      ) ?? {
        command: cmd.name,
      };

      //View permissions for a command
      if (options._subcommand === 'view') {
        for(const setting in commandSettings) {
          if(commandSettings[setting] instanceof Array) {
            for(const set of commandSettings[setting]) {
              description += set.channel ? `<#${set.channel}>: \`${set.disabled ? 'Disabled' : 'Enabled'}\`` : `<@&${set.role}>: \`${set.disabled  ? 'Disabled' : 'Enabled'}\``
              description += '\n'
            }
          } else {
            if(setting==='command') {
              description += `**Command**: \`${commandSettings[setting]}\``
            } else if (setting==='cooldown') {
              description += `**Cooldown**: \`${ms(commandSettings[setting])}\``
            } else if(setting==='disabled') {
              description += `**Server Disabled**: \`${commandSettings[setting]}\``
            }
            description += '\n'
          }
        }
      }

      //Enable or disable a channel for a command
      else {
        if (options._hoistedOptions.find((option) => option.name === 'channel')) {
          const channel = await options._hoistedOptions.find((option) => {
            return option.name === 'channel';
          }).channel;
          if (!channel.isText()) {
            color = 'RED';
            description += `\`${channel.name}\` is not a text channel.\n`;
          } else {
            if (!commandSettings.channels) {
              commandSettings.channels = [];
            }
            if (commandSettings.channels.find((c) => c.channel === channel.id)) {
              commandSettings.channels.find(
                (c) => c.channel === channel.id
              ).disabled = options._subcommand === 'disable' ? true : false;
            } else {
              commandSettings.channels.push({
                channel: channel.id,
                disabled: options._subcommand === 'disable' ? true : false,
              });
            }
            description += `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
              1,
              options._subcommand.length
            )}d command \`${cmd.name}\` in <#${channel.id}>\n`;
          }
        }

        //Enable or disable a role for a command
        if (options._hoistedOptions.find((option) => option.name === 'role')) {
          const role = options._hoistedOptions.find((option) => {
            return option.name === 'role';
          }).role;
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
          )}d command \`${cmd.name}\` for <@&${role.id}>\n`;
        }

        //Add a cooldown to a command
        if (
          options._hoistedOptions.find((option) => option.name === 'cooldown')
        ) {
          const cooldown = ms(
            options._hoistedOptions.find((option) => {
              return option.name === 'cooldown';
            }).value
          );

          commandSettings.cooldown = cooldown;
          description += `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
            1,
            options._subcommand.length
          )}d cooldown of \`${ms(cooldown)}\` for command \`${cmd.name}\`\n`;
        }

        //Enable or disable a command
        if (options._hoistedOptions.length === 1) {
          commandSettings.disabled =
            options._subcommand === 'disable' ? true : false;
          description += `${options._subcommand[0].toUpperCase()}${options._subcommand.substring(
            1,
            options._subcommand.length
          )}d command \`${cmd.name}\``;
        }
      }

      if (options._subcommand !== 'reset') {
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
      } else {
        description += `Reset command \`${cmd}\``;
      }
    } else if (options._group === 'config') {
      if (options._subcommand === 'income_command' && cmd.group !== 'income') {
        description = `Command \`${options._hoistedOptions[0].value}\` is not an income command`;
      } else {
        let income_command = options._hoistedOptions[0].value;
        let properties = await incomeSchema.findOneAndUpdate(
          {
            guildID: guild.id,
        ***REMOVED***
          {
            $pull: {
              incomeCommands: {
                command: cmd.name,
            ***REMOVED***
          ***REMOVED***
          }
        );

        properties = Object.entries(
          properties.incomeCommands.find((o) => {
            return o.command === cmd.name;
          })
        );

        let fields = [];
        options._hoistedOptions.forEach((option) => {
          if (option.name !== 'command')
            fields.push([option.name, option.value]);
        });

        color = 'GREEN';
        description = `Updated ${income_command}`;

        //Validate and transfer provided fields
        updates = '';
        properties.forEach((property) => {
          const field = fields.find((field) => field[0] === property[0]);
          if (field) {
            if (['cooldown'].includes(field[0])) {
              if (ms(field[1])) {
                property[1] = Math.abs(ms(field[1]));
                updates += `${property[0]}: ${ms(ms(property[1]))}ms\n`;
              } else {
                description += `Invalid parameter: \`${field[1]}\`\n\`${field[0]}\` must be a time!\n`;
              }
            } else if (['chance'].includes(field[0])) {
              if (parseFloat(field[1])) {
                property[1] = Math.abs(
                  field[1] < 1
                    ? parseFloat(field[1]) * 100
                    : parseFloat(field[1])
                );
                updates += `${property[0]}: ${property[1]}%\n`;
              } else {
                description += `Invalid parameter: \`${field[1]}\`\n\`${field[0]}\` must be a percentage!\n`;
              }
            } else {
              property[1] = Math.abs(+field[1]);
              updates += `${property[0]}: ${property[1]}\n`;
            }
          }
        });

        if (!updates.length) updates = 'No parameters updated';

        description = `\`\`\`\n${updates}\n\`\`\`${
          description ? `\n${description}` : ''
        }`;
        properties = Object.fromEntries(properties);
        await incomeSchema
          .findOneAndUpdate(
            {
              guildID: guild.id,
          ***REMOVED***
            {
              $push: {
                incomeCommands: {
                  ...properties,
              ***REMOVED***
            ***REMOVED***
          ***REMOVED***
            {
              upsert: true,
              new: true,
            }
          )
          .exec();
      }
    }

    const embed = util.embedify(color, title, icon_url, description, footer);

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
