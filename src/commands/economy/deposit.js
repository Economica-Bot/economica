module.exports = {
    name: 'deposit', 
    description: 'Deposit funds from your wallet to the treasury.',
    global: true, 
    format: '<amount | all>',
    options: [
        {
            name: 'amount',
            description: 'Specify the amount you wish to deposit.',
            type: 3,
            required: true,
        }
    ],
    async run(interaction, guild, author, args) {
        let color = 'GREEN', description = '', embed

        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet } = await util.getEconInfo(guild.id, author.user.id)
        const amount = args[0].value === 'all' ? wallet : parseInt(args[0].value)

        if(amount) {
            if (amount < 1 || amount > wallet) {
                color = 'RED'
                description = `Insufficient wallet: \`${amount}\`\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`
            } else {
                description = `Deposited ${cSymbol}${amount.toLocaleString()}`
                await util.setEconInfo(guild.id, author.user.id, -amount, amount, 0)
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