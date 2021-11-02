module.exports = {
  name: 'info',
  group: 'utility',
  description: "Send an embed about Economica's commands.",
  format: '<group> [channel]',
  permissions: ['ADMINISTRATOR'],
  global: true,
  options: [
    {
      name: 'group',
      description: 'Specify a command group.',
      type: 'STRING',
      required: true,
      choices: [
        {
          name: 'Configuration',
          value: 'config',
      ***REMOVED***
        {
          name: 'Economy',
          value: 'economy',
      ***REMOVED***
        {
          name: 'Income',
          value: 'income',
      ***REMOVED***
        {
          name: 'Moderation',
          value: 'moderation',
      ***REMOVED***
        {
          name: 'Shop',
          value: 'shop',
      ***REMOVED***
        {
          name: 'Statistics',
          value: 'statistics',
      ***REMOVED***
        {
          name: 'Utility',
          value: 'utility',
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'channel',
      description: 'Specify a channel.',
      type: 'CHANNEL',
  ***REMOVED***
  ],
  async run(interaction) {
    const group = interaction.options.getString('group');
    let commands = [];
    client.commands.forEach((command) => {
      if (group === command.group) {
        commands.push(command);
      }
    });

    const infoEmbed = util.embedify(
      'BLURPLE',
      `${group[0].toUpperCase() + group.substring(1, group.length)} Commands`,
      client.user.displayAvatarURL()
    );

    for (const command of commands) {
      infoEmbed.addField(
        `__**${command.name}**__`,
        //If no format, only command name is used
        `**Usage**: \`${command.name}${
          command.format ? ` ${command.format}` : ''
        }\`\n>>> *${
          command.description ? command.description : 'No description.'
        }*\n\n`
      );
    }

    const channel =
      interaction.options.getChannel('channel') ??
      guild.channels.cache.get(interaction.channelId);
    let color, description;

    if (channel.type !== 'GUILD_TEXT') {
      color = 'RED';
      description = 'Channel must be a text channel.';
    } else {
      color = 'GREEN';
      description = `Successfully sent information for **${group}** in <#${channel.id}>.`;
      channel.send({ embeds: [infoEmbed] });
    }

    embed = util.embedify(
      color,
      interaction.member.user.tag,
      interaction.member.user.displayAvatarURL(),
      description
    );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
***REMOVED***
};
