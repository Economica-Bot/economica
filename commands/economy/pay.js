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
        let id = await util.getUserID(message, user)
        if(id === 'noMemberFound') {
            return
        } 

        user = guild.members.cache.get(id).user
        const cSymbol = await util.getCurrencySymbol(guild.id, false)
        const { wallet } = await util.getEconInfo(guild.id, author.id)
        if(parseInt(amount)) {
            amount = parseInt(amount)
            if(wallet < amount) {
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username,
                    message.author.displayAvatarURL(),
                    `Insufficient wallet: ${cSymbol}${wallet}`
                ) })
            } else {
                await util.setEconInfo(guild.id, author.id, -amount, 0, -amount, false)
                await util.setEconInfo(guild.id, user.id, amount, 0, amount)
                message.channel.send({ embed: util.embedify(
                    'GREEN',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `Paid ${user.username} ${cSymbol}${amount}`
                ) })
            }
        } else if(amount === 'all') {
            if(wallet < 1) {
                message.reply(`Invalid amount! Current wallet: ${cSymbol}${wallet}`)
            } else {
                await util.setEconInfo(guild.id, author.id, -wallet, 0, -wallet, false)
                await util.setEconInfo(guild.id, user.id, wallet, 0, wallet)
                message.channel.send({ embed: util.embedify(
                    'GREEN',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `Paid ${user.username} ${cSymbol}${wallet}`
                ) })
            }
        }
    }
}