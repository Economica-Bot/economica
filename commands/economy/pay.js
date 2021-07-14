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
                    type: 'float',
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
        const { balance } = await util.getBal(guild.id, author.id)
        if(balance < amount) {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username,
                message.author.displayAvatarURL(),
                `Insufficient balance: ${cSymbol}${balance}`
            ) })
            return
        }

        await util.changeBal(guild.id, author.id, (-amount))
        await util.changeBal(guild.id, user.id, amount)
        message.channel.send({ embed: util.embedify(
            'GREEN',
            message.author.username, 
            message.author.displayAvatarURL(),
            `Paid ${user.username} ${cSymbol}${amount}`
        ) })
    }
}