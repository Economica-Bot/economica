const { Command } = require('discord.js-commando')
const fn = require('../../fn')

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            aliases: [
                'p'
            ],
            memberName: 'prefix',
            group: 'utility',
            description: 'Sets the server prefix',
            examples: [
                'prefix <prefix>'
            ],
            argsCount: 1,
            args: [
                {
                    key: 'prefix',
                    prompt: 'Specify the new server prefix.',
                    type: 'string',
                    default: 'get'
                }
            ]
        })
    }

    async run(message, { prefix }) {
        if(prefix == "get") {
            return message.channel.send(`${await fn.getPrefix(message.guild.id)}`)
        }
        if(prefix == await fn.getPrefix(message.guild.id,)) {
            return message.channel.send(`\`${prefix}\` is already the server prefix.`)
        }
        await fn.setPrefix(message.guild.id, prefix)

    }
}