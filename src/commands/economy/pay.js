module.exports = {
    name: 'pay', 
    description: 'Pay server currency to other users.',
    global: true, 
    format: '<user> <amount | all>',
    options: [
        {
            name: 'user',
            description: 'Name a user you wish to see the balance of.',
            type: 6,
            required: true
      ***REMOVED*** 
        {
            name: 'amount', 
            description: 'Specify the amount you wish to pay.', 
            type: 3, 
            required: true,
        }
    ],
    async run(interaction, guild, author, args) {
        let color = 'GREEN', description = '', embed

        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet } = await util.getEconInfo(guild.id, author.user.id)
        const member = guild.members.cache.get(args[0].value)
        const amount = args[1].value === 'all' ? wallet : parseInt(args[1].value)

        if(amount) {
            if (amount < 1 || amount > wallet) {
                color = 'RED'
                description = `Insufficient wallet: \`${amount}\`\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`
            } else {
                description = `Payed ${member.user.username} ${cSymbol}${amount.toLocaleString()}`
                await util.setEconInfo(guild.id, author.user.id, -amount, 0, amount)
                await util.setEconInfo(guild.id, member.user.id, amount, 0, amount)
            }
        } else {
            color = 'RED'
            description = `Invalid amount: \`${amount}\`\nFormat: \`${this.name} ${this.format}\``
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
    }
}