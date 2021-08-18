module.exports = {
  name: 'initialize',
  group: 'application',
  description: 'Initialize the database.',
  options: null,
  async run(interaction, guild, author, options) {
    const guildSettings = await util.initGuildSettings(guild)
    interaction.reply(`Init \`\`\`${guildSettings.toString()}\`\`\``)
***REMOVED***
};
