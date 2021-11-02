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
  async run(interaction) {
    const commandName = interaction.options.getString('command');
    const command = client.commands.get(commandName);
    if (command) {
      const cmd = require(`../../commands/${command.group}/${command.name}.js`);
      await client.guilds.cache.get(process.env.GUILD_ID).commands.create(cmd);
      client.commands.set(cmd.name, cmd);
      const embed = util.embedify(
        'GREEN',
        interaction.member.user.tag,
        interaction.member.user.displayAvatarURL(),
        `Force loaded \`${cmd.name}\``
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = util.embedify(
        'RED',
        interaction.member.user.tag,
        interaction.member.user.displayAvatarURL(),
        `Command \`${commandName}\` not found.`
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
***REMOVED***
};
