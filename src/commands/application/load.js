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
    let color, description;
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
          color = 'GREEN';
          description = `Force loaded \`${command.name}\``;
          break;
        } else {
          color = 'RED';
          description = `Command \`${options._hoistedOptions[0].value}\` not found.`;
        }
      }
    }

    const embed = util.embedify(
      color,
      author.user.username,
      author.user.displayAvatarURL(),
      description
    );

    interaction.editReply({ embeds: [embed], ephemeral: true });
***REMOVED***
};
