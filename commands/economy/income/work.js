const { Command } = require('discord.js-commando')
const util = require('../../../features/util')
const ms = require('ms')

module.exports = class WorkCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'work',
            group: 'income',
            memberName: 'work',
            guildOnly: true,
            description: 'Earn cash money.',
            details: 'Work to increase your cash balance.',
            argsCount: 0
        })
    }

    async run(message) {
        try {
            const properties = await util.getCommandStats(message.guild.id, 'work', true, false); console.log(properties)
            const uProperties = await util.getUserCommandStats(message.guild.id, message.author.id, 'work', true, false); console.log(uProperties)
            if (!util.isCooldown(message, properties, uProperties)) return
            const currencySymbol = await util.getCurrencySymbol(message.guild.id, false)
            const amount = util.intInRange(properties.min, properties.max)
            message.channel.send({
                embed: util.embedify(
                    'GREEN',
                    message.author.tag,
                    message.author.displayAvatarURL(),
                    `You worked and earned ${currencySymbol}${amount.toLocaleString()}!`
                )
            })
            await util.setEconInfo(message.guild.id, message.author.id, amount, 0, amount, false)
            await util.setUserCommandStats(message.guild.id, message.author.id, 'work', { timestamp: util.now() })
        } catch(err) {
            console.log(err)
        }
    }
}