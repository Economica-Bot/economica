const Discord = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const fs = require('fs');
const ms = require('ms');
const util = require('./util/util');
const mongo = require('./util/mongo/mongo');
const config = require('./config.json');
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

  const checkMutes = require('./util/features/check-mute');
  checkMutes(client);
  const checkLoans = require('./util/features/check-loan');
  checkLoans();

  console.log(`${client.user.tag} Ready`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);
  const channel = interaction.channel;
  const member = interaction.member;
  const guild = interaction.guild;
  const options = interaction.options;
  const fops = {}
  options._hoistedOptions.forEach((o) => {
    fops[o.name] = o.value;
  });

  //Check permission
  const permissible = await client.permissible(member, guild, channel, command);
  if (permissible.length) {
    const embed = util.embedify(
      'RED',
      member.user.username,
      member.user.displayAvatarURL(),
      permissible
    );

    interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  //Check cooldown
  if (!(await client.coolDown(interaction))) {
    return;
  }

  const properties = {
    command: interaction.command.name,
    timestamp: new Date().getTime(),
  };

  await util.setUserCommandStats(guild.id, member.user.id, properties);

  await command
    ?.run(interaction, guild, member, options, fops)
    .catch((error) => client.error(error, interaction, command));
});

client.login(process.env.ECON_ALPHA_TOKEN);

client.registerCommands = async () => {
  const commands = [];
  const commandDirectories = fs.readdirSync('./commands');
  for (const commandDirectory of commandDirectories) {
    const commandFiles = fs
      .readdirSync(`./commands/${commandDirectory}/`)
      .filter((file) => file.endsWith('js'));
    for (const commandFile of commandFiles) {
      const command = require(`./commands/${commandDirectory}/${commandFile}`);
      client.commands.set(command.name, command);
      commands.push(command);
    }
  }

  //await client.application.commands.set(ApplicationCommandOptionData) //Global
  await (
    await client.guilds.fetch(process.env.GUILD_ID)
  ).commands.set(commands);
  console.log('Commands registered');
};

client.permissible = async (author, guild, channel, command) => {
  let missingClientPermissions = [],
    missingUserPermissions = [],
    missingRoles = [],
    disabledRoles = [],
    permissible = '';

  const guildSettings = await guildSettingsSchema.findOne({
    guildID: guild.id,
  });

  if (guildSettings?.modules) {
    for (const moduleSetting of guildSettings?.modules) {
      if (moduleSetting?.module === command?.group && moduleSetting?.disabled) {
        permissible += `The \`${moduleSetting.module}\` command module is disabled.\n`;
        break;
      }
    }
  }

  if (guildSettings?.commands) {
    for (const commandSetting of guildSettings?.commands) {
      if (commandSetting?.command === command?.name) {
        if (commandSetting?.channels) {
          for (const channelSetting of commandSetting?.channels) {
            if (
              channelSetting?.channel === channel.id &&
              channelSetting?.disabled
            ) {
              permissible += `This command is disabled in <#${channelSetting.channel}>.\n`;
              break;
            }
          }
        }

        if (commandSetting?.roles) {
          for (const roleSetting of commandSetting?.roles) {
            if (
              author.roles.cache.has(roleSetting?.role) &&
              roleSetting?.disabled
            ) {
              disabledRoles.push(`<@&${roleSetting.role}>`);
            }
          }
        }

        if (commandSetting?.disabled) {
          permissible += `This command is disabled.\n`;
          break;
        }
      }
    }
  }

  const clientMember = await guild.members.cache.get(client.user.id);

  if (command?.permissions) {
    for (const permission of command.permissions) {
      if (!clientMember.permissionsIn(channel).has(permission)) {
        missingClientPermissions.push(`\`${permission}\``);
      }
      if (!author.permissionsIn(channel).has(permission)) {
        missingUserPermissions.push(`\`${permission}\``);
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

  if (command?.ownerOnly && !config.botAuth.admin_id.includes(author.user.id)) {
    permissible += 'You must be an `OWNER` to run this command.\n';
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

client.coolDown = async (interaction) => {
  const result = await guildSettingsSchema.findOne({
    guildID: interaction.guild.id,
  });

  properties = result.commands.find((c) => {
    return c.command === interaction.command.name;
  });

  const uProperties = await util.getUserCommandStats(
    interaction.guild.id,
    interaction.user.id,
    interaction.command.name
  );

  const { cooldown } = properties || config.commands['default'];
  const { timestamp } = uProperties;
  const now = new Date().getTime();

  if (now - timestamp < cooldown) {
    const embed = util.embedify(
      'GREY',
      interaction.member.user.username,
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

process.on('unhandledRejection', (error) => {
  client.error(error);
});

process.on('uncaughtException', (error) => {
  client.error(error);
});

client.error = async (error, interaction = null, command = null) => {
  let description, title, icon_url;
  if (interaction) {
    title = interaction.member.user.username;
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
