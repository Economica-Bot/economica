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
        const currencySymbol = await helper.getCurrencySymbol(message.guild.id)

        const properties = await helper.getIncomeStats(message.guild.id, 'work')
        const uProperties = await helper.getUserCommandStats(message.guild.id, message.author.id, 'work')

        if ((Date.now() - uProperties.timestamp) > properties.cooldown) {
            // TODO
        }
        const min = properties.min; const max = properties.max
        const amount = helper.intInRange(min, max)
        
        helper.changeBal(message.guild.id, message.author.id, amount)
        helper.successEmbed(message, `You worked and earned ${currencySymbol}${amount}!`)
    }
}