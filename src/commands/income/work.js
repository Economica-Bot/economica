module.exports = {
    name: 'work',
    group: 'income',
    description: 'Earn wallet money',
    global: true, 
    options: null, 
    async run(interaction, guild, author, args) {
        const guildID = guild.id, userID = author.id
        const properties = await util.getCommandStats(guildID, this.name) 
        const uProperties = await util.getUserCommandStats(guildID, userID, this.name)
        if (!await util.coolDown(interaction, properties, uProperties)) {
            return
        }

        const currencySymbol = await util.getCurrencySymbol(guildID)
        const amount = util.intInRange(properties.min, properties.max)
        embed = util.embedify(
            'GREEN',
            author.user.username,
            author.user.displayAvatarURL(),
            `You worked and earned ${currencySymbol}${amount.toLocaleString()}!`
        )

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
          ***REMOVED***
        }})

        await util.setEconInfo(guildID, userID, amount, 0, amount)
        await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() })
    }
}