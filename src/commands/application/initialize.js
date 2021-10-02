module.exports = {
  name: 'initialize',
  group: 'application',
  description: 'Initialize the database.',
  options: null,
  ownerOnly: true, 
  async run(interaction, guild) {
    const settings = await util.initGuildSettings(guild);
    await interaction.reply(`Init \`\`\`${settings.toString()}\`\`\``);
***REMOVED***
};
