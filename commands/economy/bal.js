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
        const { guild } = message
        let users = await helper.findUser(message, user)
        if (users === 'noUserFound') {
            return
        } 
    
        // If user is not an array   
        else if (!Array.isArray(users)) {
            return helper.displayBal(message, guild, users)
        } 

        // if there is only one user in the array (from match)
        else if (users.length === 1) {
            const user = message.guild.members.cache.get(users[0]).user
            return helper.displayBal(message, guild, user)
        }

        // If multiple members are found
        else {
            await helper.memberSelectEmbed(message, users, 10000, 'bal')
        }
    }
}
