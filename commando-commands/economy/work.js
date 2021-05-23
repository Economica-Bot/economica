const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')

module.exports = class WorkCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'work',
            group: 'economy',
            memberName: 'work',
            guildOnly: true,
            description: 'Earn cash money.',
            details: 'Work to increase your cash balance.',
            format: 'work',
            examples: [
                'work'
            ],
            argsCount: 0
        })
    }

    async run(message) {
        const range = await helper.getIncome(message.guild.id, 'work')
        const min = range.min; const max = range.max
        const amount = Math.floor((Math.random() * (max - min + 1)) + min)
        const currencySymbol = await helper.getCurrencySymbol(message.guild.id)
        helper.changeBal(message.guild.id, message.author.id, amount)
        helper.successEmbed(message, `You worked and earned ${currencySymbol}${amount}!`)
    }
}