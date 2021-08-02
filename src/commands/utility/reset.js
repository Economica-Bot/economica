module.exports = {
    name: 'reset',
    description: 'Resets all slash commands.', 
    global: true, 
    options: null,
    ownerOnly: true,
    async run(interaction, guild, author, args) {
        client.guilds.cache.forEach(guild => {
            client.guilds.cache.get(guild.id).commands.set([])
        })

        client.commands.set([])
        embed = util.embedify(
            'GREEN', 
            author.user.username, 
            author.user.displayAvatarURL(), 
            '\`RESET ALL SLASH COMMANDS\`'
        )
        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
                flags: 64
          ***REMOVED***
        }})
    }
}