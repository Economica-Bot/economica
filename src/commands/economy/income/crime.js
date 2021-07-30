const { Command } = require('discord.js-commando')
const util = require('../../../features/util')
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
            argsCount: 0
        })
    }

    async run(message) {
        const { guild, author } = message
        const guildID = guild.id; const userID = author.id
        const properties = await util.getCommandStats(guildID, this.name)
        const uProperties = await util.getUserCommandStats(guildID, userID, this.name)
        if (!util.coolDown(message, properties, uProperties)) {
            return
        } 

        let color, description, amount
        const { min, max, minFine, maxFine } = properties
        const cSymbol = await util.getCurrencySymbol(guildID)
        if (!util.isSuccess(properties)) {
            amount = util.intInRange(minFine, maxFine)
            color = 'RED'
            description = `You were caught commiting a crime and fined ${cSymbol}${amount.toLocaleString()}`
            amount *= -1
        } else {
            amount = util.intInRange(min, max)
            color = 'GREEN'
            description = `You commited a crime and earned ${cSymbol}${amount.toLocaleString()}!`
        }

        message.channel.send({ embed: util.embedify(
            color, 
            author.username, 
            author.displayAvatarURL(),
            description
        ) })

        await util.setEconInfo(guildID, userID, amount, 0, amount) 
        await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() })
    }
}