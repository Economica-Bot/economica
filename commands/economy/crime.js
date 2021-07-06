const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const ms = require('ms')

module.exports = class BegCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'crime',
            group: 'economy',
            memberName: 'crime',
            guildOnly: true,
            description: 'Possibly earn cash money',
            details: 'Commit a crime to increase your cash balance with risk of fine',
            format: '',
            examples: [
                'crime'
            ],
            argsCount: 0
        })
    }

    async run(message) {
        const { guild, author } = message
        const currencySymbol = await util.getCurrencySymbol(message.guild.id)

        const properties = await util.getCommandStats(message.guild.id, 'crime')
        const uProperties = await util.getUserCommandStats(guild.id, author.id, 'crime')

        const now = new Date
        const usedWhen = now.getTime()

        console.log('crime', properties)

        if ((usedWhen - uProperties.timestamp) < properties.cooldown) {
            return util.errorEmbed(message, `:hourglass: You need to wait ${ms(properties.cooldown - (Date.now() - uProperties.timestamp))}`, this.memberName) // RIP the command if user is speedy
        }

        // reset the timestamp when used
        util.setUserCommandStats(guild.id, author.id, 'crime', { timestamp: usedWhen })

        if ((Math.random() * 100) < properties.chance) {
            const fineAmount = util.intInRange(properties.minFine, properties.maxFine)
            util.changeBal(guild.id, author.id, (fineAmount * -1))
            return util.errorEmbed(message, `You were caught and fined ${currencySymbol}${fineAmount}`, this.memberName)
        }

        const min = properties.min; const max = properties.max
        const amount = util.intInRange(min, max)

        util.changeBal(message.guild.id, message.author.id, amount)
        util.successEmbed(message, `You committed a crime and earned ${currencySymbol}${amount}!`)
    }
}