const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: [
                'h',
            ],
            memberName: 'help',
            guildOnly: true,
            group: 'utility',
            description: 'Lists available commands, or detailed information about a specific command.',
            details: 'The command query may be a substring of an entire command name. If there is no command input, all available commands will be listed.',            format: 'help [command]',
            examples: [
                'help',
                'help ping'
            ],
            args: [
                {
                    key: 'command',
                    prompt: 'please enter a command that you would like help with.',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    async run(message, args) {
        const groups = this.client.registry.groups
        const commands = this.client.registry.findCommands(args.command, false, message)
        const showAll = args.command && args.command.toLowerCase() === 'all'
        if (args.command && !showAll) {
            if (commands.length === 1) {
                let helpDesc = ''
                if (commands[0].aliases) helpDesc += `${commands[0].aliases}`
                if (commands[0].description) helpDesc += `\n${commands[0].description}`
                if (commands[0].details) helpDesc += `\n${commands[0].details}`
                if (commands[0].format) helpDesc += `\n${commands[0].format}`
                if (commands[0].examples) helpDesc += `\n${commands[0].examples}`
                if (commands[0].guildOnly) helpDesc += `\nOnly usable in servers.`


                let helpEmbed = new MessageEmbed()
                .setTitle(`${commands[0].name}`)
                .setDescription(
                    helpDesc
                )

                message.say(helpEmbed)
            } else if (commands.length > 1) {
                message.reply(`${commands.length} commands found. Please be more specific.`)
            } 
        } else {
            message.reply(`Command ${args[0]} not found.`)
        }
    }
} 