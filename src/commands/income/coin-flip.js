module.exports = {
    name: 'coinflip',
    description: 'Double the money in your wallet by flipping a coin.',
    global: true, 
    format: '<amount | all>',
    options: [
        {
            name: 'amount', 
            description: 'Specify the amount you wish to withdraw.', 
            type: 3, 
            required: true, 
        }
    ], 
    async run(interaction, guild, author, args) {
        const properties = await util.getCommandStats(guild.id, this.name)
        const uProperties = await util.getUserCommandStats(guild.id, author.id, this.name)
        const { wallet } = await util.getEconInfo(guild.id, author.id)

        if(!util.coolDown(interaction, properties, uProperties)) {
            return
        }

        let color = 'RED', description = '', embed
        let amount = args[0].value === 'all' ? wallet : parseInt(args[0].value)
        const cSymbol = await util.getCurrencySymbol(guild.id)
        if(wallet < 1 || wallet < amount) {
            description = `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}`
        } else {
            if(!util.isSuccess(properties)) {
                description = `You flipped a coin and lost ${cSymbol}${amount.toLocaleString()}`
                amount = -amount
            } else {
                color = 'GREEN'
                description = `You flipped a coin and earned ${cSymbol}${amount.toLocaleString()}`
            }

            util.setEconInfo(guild.id, author.id, amount, 0, amount)
        } 

        embed = util.embedify(
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

        await util.setUserCommandStats(guild.id, author.id, this.name, { timestamp: new Date().getTime() })
    }
}