const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const ms = require('ms')

module.exports = class CrimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'crime',
            group: 'income',
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
        const properties = await util.getCommandStats(message.guild.id, 'crime', true, false)
        const uProperties = await util.getUserCommandStats(message.guild.id, message.author.id, 'crime', true, false)
        if (!util.isCooldown(message, properties, uProperties)) return // if cd is not up, end command
        const { min, max, minFine, maxFine } = properties
        const fineAmount = util.intInRange(minFine, maxFine)
        const cSymbol = await util.getCurrencySymbol(message.guild.id, false)
        if (!util.isSuccess(properties)) {
            message.channel.send({
                embed: util.embedify(
                    'RED',
                    message.author.tag,
                    message.author.displayAvatarURL(),
                    `You were caught commiting a crime and fined ${cSymbol}${fineAmount.toLocaleString()}`
                )
            })
            await util.changeBal(message.guild.id, message.author.id, fineAmount * -1, false) // subtract fine from bal
            return await util.setUserCommandStats(message.guild.id, message.author.id, 'crime', { timestamp: util.now() }, false) // if not successful, still reset the timestamp before ending the command
        }
        const amount = util.intInRange(min, max)
        message.channel.send({
            embed: util.embedify(
                'GREEN',
                message.author.tag,
                message.author.displayAvatarURL(),
                `You commited a crime and earned ${cSymbol}${amount.toLocaleString()}!`
            )
        })
        await util.setUserCommandStats(message.guild.id, message.author.id, 'crime', { timestamp: util.now() }, false) // reset timestamp
        await util.changeBal(message.guild.id, message.author.id, amount) // +close mongo connection
    }
}