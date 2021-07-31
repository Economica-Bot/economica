module.exports = {
    name: 'servers',
    description: `Get information about ${client.user.tag}'s servers`,
    commandOptions: null, 
    global: true, 
    async run(interaction) {

        let serverCount = 0, memberCount = 0, description = ''

        client.guilds.cache.forEach((guild) => {
            serverCount++
            memberCount += guild.memberCount
            description += `**${guild}** | \`${guild.memberCount.toLocaleString()}\` Members\n`
        })

        const embed = util.embedify('GREEN', 'Server List', client.user.displayAvatarURL(), description)

        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              embeds: [ embed ],
              flags: '64' //ephemeral
          ***REMOVED***
        }})
    }
}