module.exports = {
    name: 'beg', 
    group: 'income',
    description: 'Possibly earn wallet money', 
    global: true,
    options: null,
    async run(interaction, guild, author, options) {
        const guildID = guild.id, userID = author.id
        const properties = await util.getCommandStats(guildID, this.name)
        const uProperties = await util.getUserCommandStats(guildID, userID, this.name)
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
            await util.transaction(guildID, userID, this.name, '`system`', amount, 0, amount) 
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

        await interaction.reply({ embeds: [ embed ]})

        await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() }) 
    }
}