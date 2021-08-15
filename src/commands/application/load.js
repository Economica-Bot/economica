const fs = require('fs');

module.exports = {
  name: 'load',
  description: 'Load a slash command.',
  group: 'application',
  global: true,
  ownerOnly: true,
  options: [
    {
      name: 'command',
      description: 'Specify a command.',
      type: 3,
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const commandDirectories = fs.readdirSync('./commands');
    for (const commandDirectory of commandDirectories) {
      const commandFiles = fs
        .readdirSync(`./commands/${commandDirectory}/`)
        .filter((file) => file.endsWith('js'));
      for (const commandFile of commandFiles) {
        const command = require(`../../commands/${commandDirectory}/${commandFile}`);
        if (options._hoistedOptions[0].value === command.name) {
          interaction.deferReply({ ephemeral: true });
          await client.guilds.cache
            .get(process.env.GUILD_ID)
            .commands.create(command);
          client.commands.set(command.name, command);
          const embed = util.embedify(
            'GREEN',
            author.user.username,
            author.user.displayAvatarURL(),
            `Force loaded \`${command.name}\``
          );

          interaction.editReply({ embeds: [embed], ephemeral: true });
          return;
        }
      }
    }
    
    const embed = util.embedify(
      'RED',
      author.user.username,
      author.user.displayAvatarURL(),
      `Command \`${options._hoistedOptions[0].value}\` not found.`
    );

    interaction.reply({ embeds: [embed], ephemeral: true });
***REMOVED***
};
