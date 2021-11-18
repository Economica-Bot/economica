module.exports = {
  name: 'initialize',
  group: 'application',
  description: 'Initialize the database.',
  options: null,
  ownerOnly: true,
  async run(interaction) {
    const settings = await util.initGuildSettings(interaction.guild);
    return await interaction.reply(
      `Init \`\`\`${settings[0].toString()}\n\n${settings[1].toString()}\`\`\``
    );
***REMOVED***
};
