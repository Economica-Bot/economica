module.exports = {
    name: 'currency',
    group: 'economy',
    description: 'View and update the currency symbol',
    permissions: [
        'ADMINISTRATOR'
    ],
    global: true,
    options: [
        {
            name: 'currency',
            description: 'Specify a currency symbol.',
            type: 3,
        }
    ],
    async run(interaction, guild, author, options) {
        let color, description, footer, embed, currency = options._hoistedOptions?.[0]?.value
        const currCurrencySymbol = await util.getCurrencySymbol(guild.id)
        if (!currency) {
            color = 'BLURPLE'
            description = `The currency symbol is: ${currCurrencySymbol}`
        } else if (currency === currCurrencySymbol) {
            color = 'RED'
            description = `${currency} is already the server currency symbol.`
        } else {
            color = 'GREEN'
            description = `Currency symbol set to ${await util.setCurrencySymbol(guild.id, currency)}`
            footer = currency
        }

        embed = util.embedify(
            color,
            guild.name, 
            guild.iconURL(),
            description, 
            footer
        )
        
        interaction.reply({ embeds: [ embed ] })
    }
}