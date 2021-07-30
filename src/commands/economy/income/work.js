const { Command } = require('discord.js-commando')
const util = require('../../../features/util')

module.exports = class WorkCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'work',
            group: 'income',
            memberName: 'work',
            guildOnly: true,
            description: 'Earn wallet money.',
        })
    }

    async run(message) {
        const { guild, author } = message
        const properties = await util.getCommandStats(guild.id, this.name) 
        const uProperties = await util.getUserCommandStats(guild.id, author.id, this.name)
        if (!util.coolDown(message, properties, uProperties)) {
            return
        }

        const currencySymbol = await util.getCurrencySymbol(guild.id)
        const amount = util.intInRange(properties.min, properties.max)
        message.channel.send({
            embed: util.embedify(
                'GREEN',
                author.username,
                author.displayAvatarURL(),
                `You worked and earned ${currencySymbol}${amount.toLocaleString()}!`
            )
        })

        await util.setEconInfo(guild.id, author.id, amount, 0, amount)
        await util.setUserCommandStats(guild.id, author.id, this.name, { timestamp: new Date().getTime() })
    }
}