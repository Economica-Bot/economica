module.exports = {
    name: 'dice',
    description: 'Roll a dice to and win some cash.',
    group: 'casino',
    global: true, 
    options: [
        {
            name: 'bet', 
            description: 'Specify a bet.',
            type: 'NUMBER',
            required: true
      ***REMOVED***
        {
            name: 'number',
            description: 'Choose a number.',
            type: 'INTEGER',
            required: true        
      ***REMOVED***
    ],
    async run(interaction, guild, author, options) {
        let color = 'GREEN', title = author.user.username, icon_url = author.user.displayAvatarURL(), description
        const bet = options._hoistedOptions[0].value
        const number = options._hoistedOptions[1].value;
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet } = await util.getEconInfo(guild.id, author.user.id)
        if(number < 0 || number > 6) {
            color = 'RED'
            description = `Invalid value: \`${number}\``
        } else if(bet < 0 || bet > wallet) {
            color = 'RED', 
            description = `Insufficient wallet: ${cSymbol}${bet}`
        } else {
            const diceRoll = Math.floor(Math.rand() * 6 + 1);
            if(number === diceRoll) {
                bet*=4
                description = `You rolled a dice and won ${cSymbol}${(bet).toLocaleString()}`
            } else {
                color = 'RED', 
                description = `You rolled a dice and lost ${cSymbol}${bet.toLocaleString()}`
                bet*=-1
            }

            await util.transaction(guild.id, author.user.id, this.name, description, bet, 0, bet)
        }

        await interaction.reply({
            embeds: [
                util.embedify(
                    color, title, icon_url, description
                )
            ]
        })
    }
}