const { Command } = require('discord.js-commando')

const util = require('../../../features/util')
const { oneLine } = require('common-tags')

module.exports = class RobCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rob',
            group: 'income',
            memberName: 'rob',
            guildOnly: true, 
            description: 'Rob users. HIGH RISK',
            details: oneLine`You might steal up to the entire target's wallet.`,
            format: '[@mention | id | name]',
            examples: [
                'rob @Economica',
                'rob Economica'
            ],
            args: [
                {
                    key: 'user',
                    prompt: 'Please @mention, name, or provide the id of a user.',
                    type: 'string',
                    default: '',
                }
            ]
        })
    }

    async run(message, { user }) {
        const { author, guild } = message
        const guildID = guild.id; const userID = author.id
        let id = await util.getUserID(message, user)
        if(id === 'noMemberFound') {
            return
        }

        user = guild.members.cache.get(userID).user
        const properties = await util.getCommandStats(guildID, this.name)
        const uProperties = await util.getUserCommandStats(guildID, userID, this.name)
        
        if(!util.coolDown(message, properties, uProperties)) {
            return
        }

        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { minFine, maxFine } = properties
        let color, description, amount
        const { wallet } = await util.getEconInfo(guildID, id)
        if(wallet < 1) {
            color = 'RED',
            description = `<@!${id}>\nInsufficient wallet: ${cSymbol}${wallet}`
        } else {
            if(util.isSuccess(properties)) {
                amount = util.intInRange(0, wallet)
                color = 'GREEN',
                description = `You robbed <@!${id}> for a grand total of ${cSymbol}${amount.toLocaleString()}!`
                await util.setEconInfo(guildID, id, -amount, 0, -amount)
            } else {
                amount = util.intInRange(minFine, maxFine)
                color = 'RED',
                description = `You were caught robbing and fined ${cSymbol}${amount.toLocaleString()}`
                amount *= -1
            }

            await util.setEconInfo(guildID, userID, amount, 0, amount)
            await util.setUserCommandStats(guildID, userID, this.name, { timestamp: new Date().getTime() })
        }

        message.channel.send({ embed: util.embedify(
            color, 
            author.username, 
            author.displayAvatarURL(),
            description
        ) })
    }
}