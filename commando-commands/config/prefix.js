const { Command } = require('discord.js-commando')
const helper = require('../../helper')

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            aliases: [
                'p'
            ],
            guildOnly: true,
            memberName: 'prefix',
            group: 'config',
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
            return message.channel.send(`${await helper.getPrefix(message.guild.id)}`)
        }
        if(prefix == await helper.getPrefix(message.guild.id,)) {
            return message.channel.send(`\`${prefix}\` is already the server prefix.`)
        }
        message.channel.send(`Server prefix set to \`${await helper.setPrefix(message.guild.id, prefix)}\``)
    }
}