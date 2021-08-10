module.exports = {
    name: 'crime', 
    group: 'income',
    description: 'Commit a crime to increase your wallet balance with risk of fine.',
    global: true, 
    options: null,
    async run(interaction, guild, author, options) {
        const guildID = guild.id, userID = author.id
        const properties = await util.getCommandStats(guildID, this.name)
        const uProperties = await util.getUserCommandStats(guildID, userID, this.name)
        if (!await util.coolDown(interaction, properties, uProperties)) {
            return
        } 

        let color, description, amount
        const { min, max, minfine, maxfine } = properties
        const cSymbol = await util.getCurrencySymbol(guildID)
        if (!util.isSuccess(properties)) {
            amount = util.intInRange(minfine, maxfine)
            color = 'RED'
            description = `You were caught commiting a crime and fined ${cSymbol}${amount.toLocaleString()}`
            amount *= -1
        } else {
            amount = util.intInRange(min, max)
            color = 'GREEN'
            description = `You commited a crime and earned ${cSymbol}${amount.toLocaleString()}!`
        }

        const embed = util.embedify(
            color, 
            author.user.username, 
            author.user.displayAvatarURL(),
            description
        ) 

        await interaction.reply({ embeds: [ embed ]})

        await util.transaction(guildID, userID, this.name, '`system`', amount, 0, amount) 
        await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() })
    }
}