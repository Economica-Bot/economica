const Discord = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const path = require('path');
const fs = require('fs');
const ms = require('ms');
const util = require(path.join(__dirname, '/util/util'));
const mongo = require(path.join(__dirname, '/util/mongo/mongo'));
const config = require(path.join(__dirname, '/config.json'));
const guildSettingsSchema = require('@schemas/guild-settings-sch');

require('dotenv').config();

const client = new Discord.Client({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_BANS',
    'GUILD_MEMBERS',
    'GUILD_MESSAGES',
    'DIRECT_MESSAGES',
  ],
});

client.commands = new Discord.Collection();

global.client = client;
global.Discord = Discord;
global.util = util;
global.mongo = mongo;
global.apiTypes = ApplicationCommandOptionType;

client.on('ready', async () => {
  await client.registerCommands();

  await mongo().then(() => {
    console.log('Connected to DB');
  });

  const checkMutes = require(path.join(__dirname, '/util/features/check-mute'));
  await checkMutes(client);
  const checkLoans = require(path.join(__dirname, '/util/features/check-loan'));
  await checkLoans();
  const checkActive = require(path.join(
    __dirname,
    '/util/features/shop-item-handler'
  ));
  await checkActive();
  const generate = require(path.join(__dirname, '/util/features/generator'));
  await generate();

  console.log(`${client.user.tag} Ready`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (
    command?.ownerOnly &&
    config.botAuth.admin_id.includes(interaction.user.id)
  ) {
  } else {
    //Check permission
    const permissible = await client.permissible(
      interaction.member,
      interaction.guild,
      interaction.channel,
      command
    );
    if (permissible.length) {
      const embed = util.embedify(
        'RED',
        interaction.member.user.tag,
        interaction.member.user.displayAvatarURL(),
        permissible
      );

      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    //Check cooldown
    if (!(await client.coolDown(interaction, command))) {
      return;
    }

    const properties = {
      command: interaction.commandName,
      timestamp: new Date().getTime(),
    };

    await util.setUserCommandStats(
      interaction.guild.id,
      interaction.member.id,
      properties
    );
  }

  await command
    ?.run(interaction)
    .catch((error) => client.error(error, interaction, command));
});

client.on('guildCreate', (guild) => {
  util.initGuildSettings(guild);
});

client.login(process.env.ECON_ALPHA_TOKEN);

client.registerCommands = async () => {
  const commands = [];
  const commandDirectories = fs.readdirSync(path.join(__dirname, 'commands'));
  for (const commandDirectory of commandDirectories) {
    const commandFiles = fs
      .readdirSync(path.join(__dirname, `commands/${commandDirectory}/`))
      .filter((file) => file.endsWith('js'));
    for (const commandFile of commandFiles) {
      const command = require(path.join(
        __dirname,
        `/commands/${commandDirectory}/${commandFile}`
      ));
      client.commands.set(command.name, command);
      commands.push(command);
    }
  }

  //await client.application.commands.set(commands); //Global

  await (
    await client.guilds.fetch(process.env.GUILD_ID)
  ).commands.set(commands);

  console.log('Commands registered');
};

client.permissible = async (author, guild, channel, command) => {
  const missingClientPermissions = [],
    missingUserPermissions = [],
    missingRoles = [],
    disabledRoles = [];
  let permissible = '';

  const clientMember = await guild.members.cache.get(client.user.id);

  if (command?.ownerOnly && !config.botAuth.admin_id.includes(author.user.id)) {
    permissible += 'You must be an `OWNER` to run this command.\n';
  }

  if (command?.permissions) {
    for (const permission of command.permissions) {
      if (!author.permissionsIn(channel).has(permission)) {
        missingUserPermissions.push(`\`${permission}\``);
      }
    }
  }

  if (command?.clientPermissions) {
    for (const permission of command.clientPermissions) {
      if (!clientMember.permissionsIn(channel).has(permission)) {
        missingClientPermissions.push(`\`${permission}\``);
      }
    }
  }

  if (command?.roles) {
    for (const role of command.roles) {
      const guildRole = guild.roles.cache.find((r) => {
        return r.name.toLowerCase() === role.name.toLowerCase();
      });

      if (!guildRole) {
        permissible += `Please create a(n) \`${role.name}\` role. Case insensitive.\n`;
      } else if (role.required && !author.roles.cache.has(guildRole.id)) {
        missingRoles.push(`<@&${guildRole.id}>`);
      }
    }
  }

  const guildSettings = await guildSettingsSchema.findOne({
    guildID: guild.id,
  });

  if (guildSettings.modules) {
    for (const moduleSetting of guildSettings.modules) {
      if (moduleSetting.module === command.group) {
        if (moduleSetting.channels) {
          for (const channelSetting of moduleSetting.channels) {
            if (
              channelSetting.channel === channel.id &&
              channelSetting.disabled
            ) {
              permissible += `The \`${moduleSetting.module}\` module is disabled in <#${channelSetting.channel}>.\n`;
              break;
            }
          }
        }

        if (moduleSetting.roles) {
          for (const roleSetting of moduleSetting.roles) {
            if (
              author.roles.cache.has(roleSetting.role) &&
              roleSetting.disabled
            ) {
              disabledRoles.push(`<@&${roleSetting.role}>`);
            }
          }
        }

        if (moduleSetting.disabled) {
          permissible += `The \`${moduleSetting.module}\` module is disabled.\n`;
          break;
        }
      }
    }
  }

  if (guildSettings.commands) {
    for (const commandSetting of guildSettings?.commands) {
      if (commandSetting.command === command?.name) {
        if (commandSetting.channels) {
          for (const channelSetting of commandSetting.channels) {
            if (
              channelSetting.channel === channel.id &&
              channelSetting.disabled
            ) {
              permissible += `This command is disabled in <#${channelSetting.channel}>.\n`;
              break;
            }
          }
        }

        if (commandSetting.roles) {
          for (const roleSetting of commandSetting?.roles) {
            if (
              author.roles.cache.has(roleSetting.role) &&
              roleSetting.disabled
            ) {
              disabledRoles.push(`<@&${roleSetting.role}>`);
            }
          }
        }

        if (commandSetting.disabled) {
          permissible += `This command is disabled.\n`;
          break;
        }
      }
    }
  }

  if (command?.disabled) {
    permissible += 'This command is disabled.\n';
  }

  if (missingClientPermissions.length) {
    permissible += `I am missing the ${missingClientPermissions.join(
      ', '
    )} permission(s) to run this command.\n`;
  }

  if (missingUserPermissions.length) {
    permissible += `You are missing the ${missingUserPermissions.join(
      ', '
    )} permission(s) to run this command.\n`;
  }

  if (missingRoles.length) {
    permissible += `You are missing the ${missingRoles.join(
      ', '
    )} role(s) to run this command.\n`;
  }

  if (disabledRoles.length) {
    permissible += `This command is disabled for the ${disabledRoles.join(
      ', '
    )} role(s).\n`;
  }

  return permissible;
};

client.coolDown = async (interaction, command) => {
  const guildSettings = await guildSettingsSchema.findOne({
    guildID: interaction.guild.id,
  });

  const commandProperties = guildSettings.commands.find((c) => {
    return c.command === command.name;
  });

  const moduleProperties = guildSettings.modules.find((m) => {
    return m.module === command.group;
  });

  const uProperties = await util.getUserCommandStats(
    interaction.guild.id,
    interaction.user.id,
    interaction.commandName
  );

  const { cooldown } =
    commandProperties || moduleProperties || config.commands['default'];
  const { timestamp } = uProperties;
  const now = new Date().getTime();

  if (now - timestamp < cooldown) {
    const embed = util.embedify(
      'GREY',
      interaction.member.user.tag,
      '', // interaction.member.user.displayAvatarURL(),
      `:hourglass: You need to wait ${ms(
        cooldown - (now - timestamp)
      )} before using this command again!`,
      `Cooldown: ${ms(cooldown)}`
    );

    interaction.reply({ embeds: [embed], ephemeral: true });

    return false;
  } else {
    return true;
  }
};

client.error = async (error, interaction = null, command = null) => {
  let description, title, icon_url;
  if (interaction) {
    title = interaction.member.user.tag;
    icon_url = interaction.member.user.displayAvatarURL();
    description = `**Command**: \`${command.name}\`\n\`\`\`js\n${error}\`\`\`
    You've encountered an error.
    Report this to Adrastopoulos#2753 or QiNG-agar#0540 in [Economica](${process.env.DISCORD}).`;
    const embed = util.embedify('RED', title, icon_url, description);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  title = error.name;
  icon_url = client.user.displayAvatarURL();
  description = `\`\`\`js\n${error.stack}\`\`\``;

  const embed = util.embedify('RED', title, icon_url, description);
  client.channels.cache.get(process.env.BOT_LOG_ID).send({ embeds: [embed] });
};

process.on('unhandledRejection', (error) => {
  client.error(error);
});

process.on('uncaughtException', (error) => {
  client.error(error);
});
