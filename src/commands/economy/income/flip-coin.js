const { Command } = require('discord.js-commando')

const util = require('../../../features/util')

module.exports = class FlipCoinCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'coinflip',
            aliases: [
                'flipcoin',
                'flip'
            ],
            group: 'income',
            memberName: 'coinflip',
            guildOnly: true,
            description: `Double the money in your wallet by flipping a coin.`,
            format: '<amount>',
            examples: [
                'coinflip 500'
            ],
            args: [
                {
                    key: 'amount',
                    prompt: 'Please enter an amount you wish to gamble.',
                    type: 'string',
                    default: 'all'
                }
            ]
        })
    }

    async run(message, { amount }) {
        const { author, guild } = message
        const properties = await util.getCommandStats(guild.id, this.name)
        const uProperties = await util.getUserCommandStats(guild.id, author.id, this.name)
        const { wallet } = await util.getEconInfo(guild.id, author.id)

        if(!util.coolDown(message, properties, uProperties)) {
            return
        }

        amount === 'all' ? amount = wallet : amount 
        amount = parseInt(amount)
        let color, description
        const cSymbol = await util.getCurrencySymbol(guild.id)
        if(wallet < 1 || wallet < amount) {
            color = 'RED'
            description = `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}`
        } else {
            if(!util.isSuccess(properties)) {
                color = 'RED'
                description = `You flipped a coin and lost ${cSymbol}${amount.toLocaleString()}`
                amount = -amount
            } else {
                color = 'GREEN'
                description = `You flipped a coin and earned ${cSymbol}${amount.toLocaleString()}`
            }

            util.setEconInfo(guild.id, author.id, amount, 0, amount)
        } 


        message.channel.send({ embed: util.embedify(
            color, 
            author.username, 
            author.displayAvatarURL(),
            description
        ) })

        await util.setUserCommandStats(guild.id, author.id, this.name, { timestamp: new Date().getTime() })
    }
}