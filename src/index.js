const Discord = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const fs = require('fs');
const util = require('./util/util');
const mongo = require('./util/mongo/mongo');
const config = require('./config.json');

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
  console.log(`${client.user.tag} Ready`);

  client.registerCommands();

  await mongo().then(() => {
    console.log('Connected to DB');
  });

  const checkMutes = require('./util/features/check-mute');
  checkMutes(client);

  const checkLoans = require('./util/features/check-loan');
  checkLoans();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);
  const author = interaction.member;
  const guild = author.guild;
  const options = interaction.options;
  const permissible = client.permissible(author, guild, command);
  if (permissible.length) {
    const embed = util.embedify(
      'RED',
      author.user.username,
      author.user.displayAvatarURL(),
      permissible
    );

    interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  command?.run(interaction, guild, author, options).catch((err) => {
    console.error(err);
    const embed = util.embedify(
      'RED',
      author.user.username,
      author.user.displayAvatarURL(),
      `**Command**: \`${command.name}\`\n\`\`\`js\n${err}\`\`\`
            You've encountered an error.
            Report this to Adrastopoulos#2753 or QiNG-agar#0540 in [Economica](https://discord.gg/Fu6EMmcgAk).`
    );

    if (interaction.replied) {
      interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  });
});

client.login(process.env.ECON_ALPHA_TOKEN);

client.registerCommands = async () => {
  const commandDirectories = fs.readdirSync('./commands');
  for (const commandDirectory of commandDirectories) {
    const commandFiles = fs
      .readdirSync(`./commands/${commandDirectory}/`)
      .filter((file) => file.endsWith('js'));
    for (const commandFile of commandFiles) {
      const command = require(`./commands/${commandDirectory}/${commandFile}`);
      await client.guilds.cache
        .get(process.env.GUILD_ID)
        .commands.create(command);
      client.commands.set(command.name, command);
      console.log(`${command.name} command registered`);
    }
  }
};

client.permissible = (author, guild, command) => {
  let missingPermissions = [],
    missingRoles = [],
    permissible = '';
  if (command?.permissions) {
    for (const permission of command.permissions) {
      if (!author.permissions.has(permission)) {
        missingPermissions.push(`\`${permission}\``);
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

  if (command?.ownerOnly && !config.botAuth.admin_id.includes(author.user.id))
    permissible += 'You must be an `OWNER` to run this command.\n';

  if (missingPermissions.length)
    permissible += `You are missing the ${missingPermissions.join(
      ', '
    )} permission(s) to run this command.\n`;

  if (missingRoles.length)
    permissible += `You are missing the ${missingRoles.join(
      ', '
    )} role(s) to run this command.\n`;

  return permissible;
};
