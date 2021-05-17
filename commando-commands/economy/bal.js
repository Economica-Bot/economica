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
            helper.getUserById(message, user) || 
            helper.getUserIdByMatch(message, user) :
            author
        if (user === 'noUserFound') {
            return
        } 
    
        // If user is not an array   
        else if (!Array.isArray(user)) {
            console.log('by id', user)
            return helper.displayBal(message, guild, user)
        } 

        // if there is only one user in the array (from match)
        else if (user.length === 1 && Array.isArray(user)) {
            user = helper.getUserById(message, user[0]).user
            console.log('by match single', user)
            helper.displayBal(message, guild, helper.getUserById(message, user))
        }
        
        // If multiple members are found
        else {
            helper.memberSelectEmbed(message, user) 
            const collector = helper.createNumberCollector(message, user.length, 10000)
            collector.on('collect', (m) => {
                user = helper.getUserById(message, user[parseInt(m.content) - 1])
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
