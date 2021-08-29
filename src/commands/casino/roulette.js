module.exports = {
    name: 'roulette',
    description: 'Play roulette.',
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
        {
            name: 'test',
            description: 'Refine your bet',
            type: 'STRING', 
            choices: [
                {
                    name: 'Evens',
                    value: 'evens'
              ***REMOVED***
                {
                    name: 'Odds',
                    value: 'odds',
              ***REMOVED***
                {
                    name: 'Reds',
                    value: 'reds'
              ***REMOVED***
                {
                    name: 'Blacks',
                    value: 'blacks'
              ***REMOVED***
                {
                    name: 'First Dozen', 
                    value: 'first_dozen'
              ***REMOVED***
                {
                    name: 'Second Dozen', 
                    value: 'second_dozen'
              ***REMOVED***
                {
                    name: 'Third Dozen', 
                    value: 'third_dozen'
                }
            ]        
        }
    ], //https://crescent.edu/post/the-basic-rules-of-roulette  
    async run(interaction, guild, author, options) {
        let color = 'GREEN', title = author.user.username, icon_url = author.user.displayAvatarURL(), description
        const bet = options._hoistedOptions[0].value
        const number = options._hoistedOptions[1].value;
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet } = await util.getEconInfo(guild.id, author.user.id)
        if(number < 0 || number > 36) {
            color = 'RED'
            description = `Invalid value: \`${number}\``
        } else if(bet < 0 || bet > wallet) {
            color = 'RED', 
            description = `Insufficient wallet: ${cSymbol}${bet}`
        } else {
            const ballPocket = Math.floor(Math.rand() * 37);
            description = `The ball landed on \`${ballPocket}\`\n`
            if(number === ballPocket) {
                bet*=4
                description += `You won ${cSymbol}${(bet).toLocaleString()}`
            } else {
                color = 'RED', 
                description += `You lost ${cSymbol}${bet.toLocaleString()}`
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