module.exports = {
    name: 'rob', 
    group: 'income',
    description: 'Rob users. Steal up to the entire target\'s wallet',
    global: true, 
    format: '<user>',
    options: [
        {
            name: 'user',
            description: 'Name a user you wish to see the balance of.',
            type: 6,
            required: true
        }
    ], 
    async run(interaction, guild, author, options) {
        const user = options._hoistedOptions[0].user
        const guildID = guild.id; const userID = author.id
        const properties = await util.getCommandStats(guildID, this.name)
        const uProperties = await util.getUserCommandStats(guildID, userID, this.name)
        
        if(!util.coolDown(interaction, properties, uProperties)) {
            return
        }

        let color, description, amount
        const { minfine, maxfine } = properties
        const { wallet } = await util.getEconInfo(guildID, user.id)
        const cSymbol = await util.getCurrencySymbol(guildID)
        if(wallet < 1) {
            color = 'RED',
            description = `<@!${user.id}>\nInsufficient wallet: ${cSymbol}${wallet}`
        } else {
            if(util.isSuccess(properties)) {
                amount = util.intInRange(0, wallet)
                color = 'GREEN',
                description = `You robbed <@!${user.id}> for a grand total of ${cSymbol}${amount.toLocaleString()}!`
                await util.transaction(guildID, user.id, this.name, `Robbed by <@!${author.user.id}>`, -amount, 0, -amount)
            } else {
                amount = util.intInRange(minfine, maxfine)
                color = 'RED',
                description = `You were caught robbing and fined ${cSymbol}${amount.toLocaleString()}`
                amount *= -1
            }

            await util.transaction(guildID, userID, this.name, `Attempted to rob <@!${user.id}>`, amount, 0, amount)
            await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() })
        }

        const embed = util.embedify(
            color, 
            author.user.username, 
            author.user.displayAvatarURL(),
            description
        )

        await interaction.reply({ embeds: [ embed ]})
    }
}