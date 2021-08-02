module.exports = {
    name: 'beg', 
    description: 'Possibly earn wallet money', 
    global: true,
    options: null,
    async run(interaction, guild, author, args) {
        const guildID = guild.id, userID = author.id
        const properties = await util.getCommandStats(guildID, this.name)
        const uProperties = await util.getUserCommandStats(guildID, userID, 'beg')
        if (!await util.coolDown(interaction, properties, uProperties)) {
            return
        }
        
        let color, description
        if (!util.isSuccess(properties)) {
                color = 'RED'
                description = 'You begged and received nothing. :slight_frown:'
        } else {
            const { min, max } = properties
            const amount = util.intInRange(min, max)
            await util.setEconInfo(guildID, userID, amount, 0, amount) 
            const cSymbol = await util.getCurrencySymbol(guild.id)
            color = 'GREEN'
            description = `You begged and earned ${cSymbol}${amount.toLocaleString()}!`
        }

        const embed = util.embedify(
            color, 
            author.user.username, 
            author.user.displayAvatarURL(),
            description
        ) 

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
          ***REMOVED***
        }})

        await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() }) 
    }
}