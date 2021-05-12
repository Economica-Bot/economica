const { Command } = require('discord.js-commando')
const helper = require('../../helper')
const { stripIndents, oneLine } = require('common-tags')

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
            format: '',
            details: oneLine`
                If no prefix is entered, current server prefix will be shown.
                If the prefix is "default", the server prefix will be set to the bot's default prefix \`.\``,
            examples: [
                'prefix <prefix>'
            ],
            argsCount: 1,
            args: [
                {
                    key: 'prefix',
                    prompt: 'Specify the new server prefix.',
                    type: 'string',
                    max: 8,
                    default: ''
                }
            ]
        })
    }

    async run(message, { prefix }) {

        //outputs the current prefix
        if(!prefix) {
            return message.say(`${message.guild.commandPrefix = await helper.getPrefix(message.guild.id)}`)
        } 
        
        if(prefix == await helper.getPrefix(message.guild.id,)) {
            return message.say(`\`${prefix}\` is already the server prefix.`)
        } else {
            message.guild.commandPrefix = prefix
            message.say(`${message.guild} command prefix set to \`${await helper.setPrefix(message.guild.id, prefix)}\`. To run commands, use ${message.anyUsage('command')}.`)
        }
    }
}