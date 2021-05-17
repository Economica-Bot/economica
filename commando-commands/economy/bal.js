const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bal',
            aliases: [
                'balance',
                'b'
            ],
            group: 'economy',
            memberName: 'balance',
            guildOnly: true,
            description: 'Returns balance in server currency',
            details: 'View your balance or someone else\'s balance by specifying the user. This can be done with @mention, id, or simply typing part of their name.',
            format: 'bal [@user | id | name]',
            examples: [
                'bal @QiNG-agar#0540',
                'bal qing'
            ],
            args: [
                {
                    key: 'member',
                    prompt: 'please @mention, name, or provide the id of a user.',
                    type: 'string',
                    default: 'self'
                }
            ]
        })
    }

    async run(message, { member }) {
        const { guild, author } = message;
        let user = member == 'self' ? author : message.mentions.users.first() || helper.getMemberUserById(message, member) || helper.getMemberUserIdByMatch(message, member);

        if ( /* slightly messy but works just fine */
            user === author || user === message.mentions.users.first() ||
            user === helper.getMemberUserById(message, member)
        ) return helper.displayBal(message, guild, user)

        if (user === 'endProcess') return;

        if (user.length === 1) return helper.displayBal(message, guild, helper.getMemberUserById(message, user[0]));

        helper.createMemberEmbedSelection(message, user) // make sure this [user] is an array and not individual array elements

        const collector = helper.createNumberCollector(message, user.length, 10000)
        collector.on('collect', m => {
            user = helper.getMemberUserById(message, user[parseInt(m.content) - 1])
        })
        collector.on('end', c => {
            if (c.size === 0) return message.channel.send(':hourglass: Time ran out (10s).')
            helper.displayBal(message, guild, user)
        })
    }
}