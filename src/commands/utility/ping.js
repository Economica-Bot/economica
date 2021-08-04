module.exports = {
    name: 'ping',
    group: 'utility',
    description: 'ping',
    commandOptions: null,
    global: true, 
    async run(interaction, guild, author, options) {
        interaction.reply({
          embeds: [
            util.embedify('GREEN', author.user.username, author.user.displayAvatarURL(), `Pong! \`${client.ws.ping}ms\``)
          ]
        })
    }
}