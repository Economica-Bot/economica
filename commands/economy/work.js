const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')
const ms = require('ms')

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
        const { guild, author } = message
        const currencySymbol = await helper.getCurrencySymbol(message.guild.id)

        const properties = await helper.getCommandStats(message.guild.id, 'work')
        const uProperties = await helper.getUserCommandStats(guild.id, author.id, 'work')

        const now = new Date
        const usedWhen = now.getTime()

        if ((usedWhen - uProperties.timestamp) < properties.cooldown) {
            return helper.errorEmbed(message, `:hourglass: You need to wait ${ms(properties.cooldown - (Date.now() - uProperties.timestamp))}`, this.memberName) // RIP the command if user is speedy
        }

        // reset the timestamp when used
        helper.setUserCommandStats(guild.id, author.id, 'work', { timestamp: usedWhen })

        const min = properties.min; const max = properties.max
        const amount = helper.intInRange(min, max)

        helper.changeBal(message.guild.id, message.author.id, amount)
        helper.successEmbed(message, `You worked and earned ${currencySymbol}${amount}!`)
    }
}