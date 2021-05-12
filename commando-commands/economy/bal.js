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
        const { guild, author } = message;
        let user = member == 'self' ? message.author : message.mentions.users.first() || helper.getMemberUserById(message, member) || helper.getMemberUserIdByMatch(message, member);

        if (user === 'endProcess') return;

        if (!Array.isArray(user)) return helper.displayBal(message, guild, user);
        if (user.length === 1) return helper.displayBal(message, guild, helper.getMemberUserById(message, user[0]));

        let userList = ``
        user.forEach(u => {
            userList = `${userList}\`${user.indexOf(u) + 1}\` - <@!${u}>\n`
        })
        const description = `\`${user.length}\` users found. Please type a specific user's key below:\n\n${userList}`
        
        message.channel.send({ embed: {
            author: {
                name: message.author.tag,
                icon_url: message.author.avatarURL()
          ***REMOVED***
            color: 'BLUE',
            description,
            footer: {
                text: 'Type the number corresponding with the user you wish to select. \nNot the users you\'re looking for? Try an @mention when using .bal'
            }
        }})

        const collector = helper.createNumberCollector(message, user.length, 30000)
        collector.on('collect', m => {
            user = helper.getMemberUserById(message, user[parseInt(m.content) - 1])
        })
        collector.on('end', c => {
            if (c.size === 0) return message.channel.send(':hourglass: Time ran out (30s).')
            helper.displayBal(message, guild, user)
        })
    }
}