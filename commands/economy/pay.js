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
                    prompt: 'Please enter an amount more than zero you wish to pay the user.',
                    type: 'integer',
                    validate: number => number > 0
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
        if(wallet < amount) {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username,
                message.author.displayAvatarURL(),
                `Insufficient wallet: ${cSymbol}${wallet}`
            ) })
            return
        }

        await util.setEconInfo(guild.id, author.id, -amount, 0, -amount, false)
        await util.setEconInfo(guild.id, user.id, amount, 0, amount)
        message.channel.send({ embed: util.embedify(
            'GREEN',
            message.author.username, 
            message.author.displayAvatarURL(),
            `Paid ${user.username} ${cSymbol}${amount}`
        ) })
    }
}