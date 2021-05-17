const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')

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
            format: 'bal [@user | id | name]',
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
        const { guild, author } = message
        user = user ?  
            message.mentions.users.first() || 
            helper.getMemberByUserId(message, user) || 
            helper.getUserIdByMatch(message, user) :
            author
        if (user === 'noUserFound') {
            return
        } 
    
        // If a single member is found    
        else if (!(user instanceof Array)) {
            return helper.displayBal(message, guild, user)
        } 
        
        // If multiple members are found
        else {
            helper.memberSelectEmbed(message, user) 
            const collector = helper.createNumberCollector(message, user.length, 10000)
            collector.on('collect', (m) => {
                user = helper.getMemberByUserId(message, user[parseInt(m.content) - 1])
            })
            collector.on('end', (c) => {
                if (c.size === 0) { 
                    return message.channel.send(':hourglass: Time ran out (10s).')
                } else {
                    helper.displayBal(message, guild, user)
                }
            })
        }
    }
}
