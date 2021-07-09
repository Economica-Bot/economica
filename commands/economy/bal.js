const { Command } = require('discord.js-commando')
const util = require('../../features/util')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bal',
            aliases: [
                'balance',
                'b',
            ],
            group: 'economy',
            memberName: 'balance',
            guildOnly: true,
            description: 'Returns balance in server currency',
            details: 'View your balance or someone else\'s balance by specifying the user. This can be done with @mention, id, or simply typing part of their name.',
            format: '[@user | id | name]',
            examples: [
                'bal @QiNG-agar#0540',
                'bal qing',
            ],
            args: [
                {
                    key: 'user',
                    prompt: 'please @mention, name, or provide the id of a user.',
                    type: 'string',
                    default: '',
              ***REMOVED***
            ],
        })
    }

    async run(message, { user }) {
        const { author, guild } = message
        let id
        if(user) {
            id = await util.getUserID(message, user)    
            if (id === 'noMemberFound') {
                return 
            }
        } else {
            id = author.id
        }

        user = guild.members.cache.get(id).user
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { balance, rank } = await util.getBal(guild.id, user.id)
        message.channel.send({ embed: util.embedify(
            'GOLD',
            user.username, 
            user.avatarURL(),
            `Balance: ${cSymbol}${balance.toLocaleString()}`,
            `🏆 Rank ${rank}`
            )
        })
    }
}
