const { Command } = require('discord.js-commando')
const util = require('../../features/util')
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
            format: '',
            examples: [
                'work'
            ],
            argsCount: 0
        })
    }

    async run(message) {
        const { guild, author } = message
        const currencySymbol = await util.getCurrencySymbol(message.guild.id)

        const properties = await util.getCommandStats(message.guild.id, 'work')
        const uProperties = await util.getUserCommandStats(guild.id, author.id, 'work')

        const now = new Date
        const usedWhen = now.getTime()

        if ((usedWhen - uProperties.timestamp) < properties.cooldown) {
            return util.errorEmbed(message, `:hourglass: You need to wait ${ms(properties.cooldown - (Date.now() - uProperties.timestamp))}`, this.memberName) // RIP the command if user is speedy
        }

        // reset the timestamp when used
        util.setUserCommandStats(guild.id, author.id, 'work', { timestamp: usedWhen })

        const min = properties.min; const max = properties.max
        const amount = util.intInRange(min, max)

        util.changeBal(message.guild.id, message.author.id, amount)
        util.successEmbed(message, `You worked and earned ${currencySymbol}${amount}!`)
    }
}