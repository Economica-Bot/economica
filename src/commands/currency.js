module.exports = {
    name: 'currency',
    description: 'View and update the currency symbol',
    global: true,
    options: [
        {
            name: 'currency',
            description: 'Specify a currency symbol.',
            type: 3,
        }
    ],
    async run(interaction) {
        const guild = await client.guilds.cache.get(interaction.guild_id)
        let color, description, footer, embed

        const currCurrencySymbol = await util.getCurrencySymbol(guild.id)
        let currency = interaction.data.options?.[0]?.value


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

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
          ***REMOVED***
        }})
    }
}