const { Command } = require('discord.js-commando')
const util = require('../../features/util')

module.exports = class PayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pay',
            group: 'economy',
            memberName: 'pay',
            guildOnly: true, 
            description: 'Pay server currency to other users.',
            details: 'Amount must be in your cash balance.',
            format: '<@mention | id | name>',
            examples: [
                'pay @Adrastopoulos#2753',
                'pay Adrast'
            ],
            args: [
                {
                    key: 'user',
                    prompt: 'Please @mention, name, or provide the id of a user.',
                    type: 'string'
              ***REMOVED*** 
                {
                    key: 'amount',
                    prompt: 'Please enter an amount you wish to pay the user.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { user, amount }) {
        const { guild, author } = message
        let color = 'GREEN', description = '', id = await util.getUserID(message, user)
        if(id === 'noMemberFound') {
            return
        } 

        user = guild.members.cache.get(id).user
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet } = await util.getEconInfo(guild.id, author.id)
        if(parseInt(amount)) {
            amount = parseInt(amount)
            if(amount < 1 || wallet < amount) {
                color = 'RED'
                description = `Invalid amount: \`${amount}\`\nInsufficient wallet: ${cSymbol}${wallet.toLocaleString()}`
            } else {
                description = `Paid ${user.username} ${cSymbol}${amount}`
                await util.setEconInfo(guild.id, author.id, -amount, 0, -amount)
                await util.setEconInfo(guild.id, user.id, amount, 0, amount)
            }
        } else if(amount === 'all') {
            if(wallet < 1) {
                color = 'RED'
                description = `Invalid amount! Current wallet: ${cSymbol}${wallet.toLocaleString()}` 
            } else {
                description = `Paid ${user.username} ${cSymbol}${wallet.toLocaleString()}`
                await util.setEconInfo(guild.id, author.id, -wallet, 0, -wallet)
                await util.setEconInfo(guild.id, user.id, wallet, 0, wallet)
            }
        } else {
            color = 'RED'
            description = `Invalid amount: \`${amount}\`\nFormat: \`${this.format}\``
        }

        message.channel.send({ embed: util.embedify(
            color, 
            message.author.username, 
            message.author.displayAvatarURL(),
            description
        ) })
    }
}