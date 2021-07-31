module.exports = {
    name: 'ping',
    description: 'ping',
    commandOptions: null,
    global: true, 
    async run(interaction) {
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              content: `Pong! \`${client.ws.ping}ms\``
            }
        }})
    }
}