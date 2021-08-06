module.exports = {
    name: 'reset',
    group: 'utility',
    description: 'Resets all slash commands.', 
    global: true, 
    options: null,
    ownerOnly: true,
    async run(interaction, guild, author, options) {
        client.guilds.cache.forEach(guild => {
            guild.commands.set([])
        })

        client.commands.set([])
        embed = util.embedify(
            'GREEN', 
            author.user.username, 
            author.user.displayAvatarURL(), 
            '\`RESET ALL SLASH COMMANDS\`'
        )
        
        await interaction.reply({ embeds: [ embed ], ephemeral: true })
    }
}