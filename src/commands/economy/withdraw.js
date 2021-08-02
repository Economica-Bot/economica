module.exports = {
    name: 'withdraw',
    description: 'Withdraw funds from the treasury to your wallet.',
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
        let color = 'GREEN', description = '', embed

        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { treasury } = await util.getEconInfo(guild.id, author.user.id)
        const amount = args[0].value === 'all' ? wallet : parseInt(args[0].value)

        if(amount) {
            if (amount < 1 || amount > treasury) {
                color = 'RED'
                description = `Insufficient treasury: \`${amount}\`\nCurrent treasury: ${cSymbol}${treasury.toLocaleString()}`
            } else {
                description = `Withdrew ${cSymbol}${amount.toLocaleString()}`
                await util.setEconInfo(guild.id, author.user.id, amount, -amount, 0)
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