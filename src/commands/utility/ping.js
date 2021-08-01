module.exports = {
    name: 'ping',
    description: 'ping',
    commandOptions: null,
    global: true, 
    async run(interaction, guild, author, args) {
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              embeds: [
                util.embedify('GREEN', author.user.username, author.user.displayAvatarURL(), `Pong! \`${client.ws.ping}ms\``)
              ]
            }
        }})
    }
}