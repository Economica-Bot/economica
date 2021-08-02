module.exports = {
    name: 'rob', 
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
    async run(interaction, guild, author, args) {
        const member = await guild.members.cache.get(args[0].value)
        const guildID = guild.id; const userID = author.id
        const properties = await util.getCommandStats(guildID, this.name)
        const uProperties = await util.getUserCommandStats(guildID, userID, this.name)
        
        if(!util.coolDown(interaction, properties, uProperties)) {
            return
        }

        let color, description, amount
        const { minFine, maxFine } = properties
        const { wallet } = await util.getEconInfo(guildID, member.user.id)
        const cSymbol = await util.getCurrencySymbol(guildID)
        if(wallet < 1) {
            color = 'RED',
            description = `<@!${member.user.id}>\nInsufficient wallet: ${cSymbol}${wallet}`
        } else {
            if(util.isSuccess(properties)) {
                amount = util.intInRange(0, wallet)
                color = 'GREEN',
                description = `You robbed <@!${member.user.id}> for a grand total of ${cSymbol}${amount.toLocaleString()}!`
                await util.setEconInfo(guildID, member.user.id, -amount, 0, -amount)
            } else {
                amount = util.intInRange(minFine, maxFine)
                color = 'RED',
                description = `You were caught robbing and fined ${cSymbol}${amount.toLocaleString()}`
                amount *= -1
            }

            await util.setEconInfo(guildID, userID, amount, 0, amount)
            await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() })
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
    }
}