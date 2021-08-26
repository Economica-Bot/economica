module.exports = {
  name: 'initialize',
  group: 'application',
  description: 'Initialize the database.',
  options: null,
  ownerOnly: true, 
  async run(interaction, guild, author, options) {
    const guildSettings = await util.initGuildSettings(guild);
    await interaction.reply(`Init \`\`\`${guildSettings.toString()}\`\`\``);
***REMOVED***
};
