module.exports = {
    name: 'ping',
    description: 'ping',
    commandOptions: null,
    global: true, 
    async run(interaction) {
        const guild = await client.guilds.fetch(interaction.guild_id)
        const author = await guild.members.fetch(interaction.member.user.id)

        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              embeds: [
                util.embedify('GREEN', interaction.member.user.username, author.user.displayAvatarURL(), `Pong! \`${client.ws.ping}ms\``)
              ]
            }
        }})
    }
}