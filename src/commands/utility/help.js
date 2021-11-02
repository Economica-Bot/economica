module.exports = {
  name: 'help',
  description:
    'Lists available commands, or detailed information about a specific command.',
  group: 'utility',
  format: '[command]',
  global: true,
  options: [
    {
      name: 'command',
      description: 'Specify a command.',
      type: 'STRING',
  ***REMOVED***
  ],
  async run(interaction) {
    let embed,
      command = interaction.options.getString('command') ?? null;
    if (!command) {
      embed = util.embedify(
        'YELLOW',
        `${client.user.username} Commands`,
        client.user.displayAvatarURL(),
        `Use \`help <cmd>\` to view specific information.`
      );

      let commands = [],
        groups = [];
      client.commands.forEach((command) => {
        if (!groups.includes(command.group)) groups.push(command.group);
        commands.push(command);
      });

      for (const group of groups) {
        let commandGroupList = [];
        for (const command of commands) {
          if (command.group === group) {
            commandGroupList.push(command.name);
          }
        }

        embed.addField(group, `\`${commandGroupList.join('`, `')}\``, true);
      }
    } else if (command) {
      let found = client.commands.find((cmd) => {
        if (cmd.name.toLowerCase().indexOf(command.toLowerCase()) != -1) {
          command = cmd;
          return true;
        }
      });

      if (found) {
        embed = util.embedify(
          'YELLOW',
          `${command.name}`,
          client.user.displayAvatarURL(),
          `>>> *${command.description}* \n${
            command.format
              ? `Format: \`${command.name} ${command.format}\``
              : ''
          }`
        );
      } else {
        embed = util.embedify(
          'RED',
          interaction.member.user.tag,
          interaction.member.user.displayAvatarURL(),
          `Command \`${command}\` not found`
        );
      }
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
***REMOVED***
};
