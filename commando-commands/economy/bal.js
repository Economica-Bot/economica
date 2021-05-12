const { Command } = require('discord.js-commando')
const helper = require('../../helper')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bal',
            aliases: [
                'balance',
                'b'
            ],
            memberName: 'balance',
            group: 'economy',
            guildOnly: true,
            description: 'Returns balance in server currency',
            examples: [
                'bal [@user | id | name]',
            ],
            args: [
                {
                    key: 'member',
                    prompt: 'please enter a user name.',
                    type: 'string',
                    default: 'self'
                }
            ]
        })
    }
    
    async run(message, { member }) {
        const { guild, author } = message
        let user = member == 'self' ? message.author : message.mentions.users.first() || helper.getMemberUserIdByMatch(message, member)
        message.say(`User: ${user}`)

    }
}