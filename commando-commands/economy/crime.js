const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')
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
            format: 'crime',
            examples: [
                'crime'
            ],
            argsCount: 0
        })
    }

    async run(message) {
        const { guild, author } = message
        const currencySymbol = await helper.getCurrencySymbol(message.guild.id)

        const properties = await helper.getCommandStats(message.guild.id, 'crime')
        const uProperties = await helper.getUserCommandStats(guild.id, author.id, 'crime')

        const now = new Date
        const usedWhen = now.getTime()

        console.log(usedWhen - uProperties.timestamp)
        console.log(properties.cooldown)

        if ((usedWhen - uProperties.timestamp) < 5000 /* properties.cooldown */) {
            return helper.errorEmbed(message, `:hourglass: You need to wait ${ms(properties.cooldown - (Date.now() - uProperties.timestamp))}`) // RIP the command if user is speedy
        }

        // reset the timestamp when used
        helper.setUserCommandStats(guild.id, author.id, 'crime', { timestamp: usedWhen })

        if ((Math.random() * 100) > properties.chance) {
            const fineAmount = helper.intInRange(properties.minFine, properties.maxFine)
            helper.changeBal(guild.id, author.id, (fineAmount * -1))
            return helper.errorEmbed(message, `You were caught and fined ${currencySymbol}${fineAmount}`)
        }

        const min = properties.min; const max = properties.max
        const amount = helper.intInRange(min, max)

        helper.changeBal(message.guild.id, message.author.id, amount)
        helper.successEmbed(message, `You committed a crime and earned ${currencySymbol}${amount}!`)
    }
}