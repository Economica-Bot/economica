module.exports = {
  name: 'initialize',
  group: 'application',
  description: 'Initialize the database.',
  options: null,
  ownerOnly: true, 
  async run(interaction) {
    const settings = await util.initGuildSettings(interaction.guild);
    await interaction.reply(`Init \`\`\`${settings.toString()}\`\`\``);
***REMOVED***
};
