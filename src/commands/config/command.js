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
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'view',
          description: "View a command's permissions.",
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'command',
              description: 'Specify a command.',
              type: 'STRING',
              required: true,
          ***REMOVED***
          ],
      ***REMOVED***
        {
          name: 'enable',
          description: 'Enable a command.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'command',
              description: 'Specify a command.',
              type: 'STRING',
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
              type: 'STRING',
              required: false,
          ***REMOVED***
          ],
      ***REMOVED***
        {
          name: 'disable',
          description: 'Disable a command.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'command',
              description: 'Specify a command.',
              type: 'STRING',
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
              type: 'STRING',
              required: false,
          ***REMOVED***
          ],
      ***REMOVED***
        {
          name: 'reset',
          description: 'Reset a command.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'command',
              description: 'Specify a command.',
              type: 'STRING',
              required: true,
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'config',
      description: 'Configure a command.',
      type: 'SUB_COMMAND_GROUP',
      options: [
        //module
        {
          name: 'income_command',
          description: 'Configure an income command.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'command',
              description: 'Specify an income command.',
              type: 'STRING',
              required: true,
          ***REMOVED***
            {
              name: 'min',
              description: 'Specify the minimum income for this command.',
              type: 'INTEGER',
          ***REMOVED***
            {
              name: 'max',
              description: 'Specify the maximum income for this command.',
              type: 'INTEGER',
          ***REMOVED***
            {
              name: 'chance',
              description: 'Specify the chance for this command.',
              type: 'STRING',
          ***REMOVED***
            {
              name: 'minfine',
              description: 'Specify the minimum fine for this command.',
              type: 'INTEGER',
          ***REMOVED***
            {
              name: 'maxfine',
              description: 'Specify the maximum fine for this command.',
              type: 'INTEGER',
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction) {
    let color = 'GREEN',
      title = interaction.member.user.username,
      icon_url = interaction.member.user.displayAvatarURL(),
      description = '',
      footer = '',
      guildID = interaction.guild.id;
    let cmd;

    const commandDirectories = fs.readdirSync('./commands');
    for (const commandDirectory of commandDirectories) {
      const commandFiles = fs
        .readdirSync(`./commands/${commandDirectory}/`)
        .filter((file) => file.endsWith('js'));
      for (const commandFile of commandFiles) {
        const command = require(`../../commands/${commandDirectory}/${commandFile}`);
        if (interaction.options.getString('command') === command.name) {
          cmd = command;
        }
      }
    }

    if (
      !cmd ||
      cmd?.untoggleable ||
      (interaction.options.getSubcommand() === 'income_command' &&
        cmd.group !== 'income')
    ) {
      color = 'RED';
      description = `Command \`${interaction.options.getString(
        'command'
      )}\` is not found or cannot be toggled`;
      footer = 'Use help for a list of commands.';
    } else if (interaction.options.getSubcommandGroup() === 'permission') {
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

      let commandSettings = guildSettings.commands.find((c) => {
        return c.command === cmd.name;
      }) ?? {
        command: cmd.name,
      };

      //View permissions for a command
      if (interaction.options.getSubcommand() === 'view') {
        for (const setting in commandSettings) {
          if (commandSettings[setting] instanceof Array) {
            for (const set of commandSettings[setting]) {
              description += set.channel
                ? `<#${set.channel}>: \`${
                    set.disabled ? 'Disabled' : 'Enabled'
                  }\``
                : `<@&${set.role}>: \`${
                    set.disabled ? 'Disabled' : 'Enabled'
                  }\``;
              description += '\n';
            }
          } else {
            if (setting === 'command') {
              description += `**Command**: \`${commandSettings[setting]}\``;
            } else if (setting === 'cooldown') {
              description += `**Cooldown**: \`${ms(
                commandSettings[setting]
              )}\``;
            } else if (setting === 'disabled') {
              description += `**Server Disabled**: \`${commandSettings[setting]}\``;
            }
            description += '\n';
          }
        }

        if (description.indexOf('cooldown') == -1) {
          description += '**Cooldown**: `5s` *(Default)*';
        }
      }

      //Change permissions for a command
      else {
        //Enable or disable a channel for a command
        if (interaction.options.getChannel('channel')) {
          const channel = interaction.options.getChannel('channel');
          if (!channel.isText()) {
            color = 'RED';
            description += `\`${channel.name}\` is not a text channel.\n`;
          } else {
            if (!commandSettings.channels) {
              commandSettings.channels = [];
            }
            if (
              commandSettings.channels.find((c) => c.channel === channel.id)
            ) {
              commandSettings.channels.find(
                (c) => c.channel === channel.id
              ).disabled =
                interaction.options.getSubcommand() === 'disable'
                  ? true
                  : false;
            } else {
              commandSettings.channels.push({
                channel: channel.id,
                disabled:
                  interaction.options.getSubcommand() === 'disable'
                    ? true
                    : false,
              });
            }
            description += `${interaction.options
              .getSubcommand()
              .toUpperCase()}D command \`${cmd.name}\` in <#${channel.id}>\n`;
          }
        }

        //Enable or disable a role for a command
        if (interaction.options.getRole('role')) {
          const role = interaction.options.getRole('role');
          if (!commandSettings.roles) {
            commandSettings.roles = [];
          }
          if (commandSettings.roles.find((r) => r.channel === role.id)) {
            commandSettings.roles.find((r) => r.role === role.id).disabled =
              interaction.options.getSubcommand() === 'disable' ? true : false;
          } else {
            commandSettings.roles.push({
              role: role.id,
              disabled:
                interaction.options.getSubcommand() === 'disable'
                  ? true
                  : false,
            });
          }
          description += `${interaction.options
            .getSubcommand()
            .toUpperCase()}D command \`${cmd.name}\` for <@&${role.id}>\n`;
        }

        //Add a cooldown to a command
        if (interaction.options.getString('cooldown')) {
          const cooldown = ms(interaction.options.getString('cooldown'));
          commandSettings.cooldown = cooldown;
          description += `${interaction.options
            .getSubcommand()
            .toUpperCase()}D cooldown of \`${ms(cooldown)}\` for command \`${
            cmd.name
          }\`\n`;
        }

        //Enable or disable a command
        if (interaction.options._hoistedOptions.length === 1) {
          commandSettings.disabled =
            interaction.options.getSubcommand() === 'disable' ? true : false;
          description += `${interaction.options
            .getSubcommand()
            .toUpperCase()}D command \`${cmd.name}\``;
        }
      }

      if (interaction.options.getSubcommand() !== 'reset') {
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
        description = `Reset command \`${cmd.name}\``;
      }
    } else if (interaction.options.getSubcommandGroup() === 'config') {
      if (
        interaction.options.getSubcommand() === 'income_command' &&
        cmd.group !== 'income'
      ) {
        description = `Command \`${interaction.options.getString(
          'command'
        )}\` is not an income command`;
      } else {
        let income_command = interaction.options.getString('command');
        let properties = await incomeSchema.findOneAndUpdate(
          {
            guildID: interaction.guild.id,
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
        interaction.options._hoistedOptions.forEach((option) => {
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
              guildID: interaction.guild.id,
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
