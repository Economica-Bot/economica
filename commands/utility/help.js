const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')

const util = require('../../features/util')

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: [
                'h',
            ],
            memberName: 'help',
            guildOnly: true,
            group: 'util',
            description: 'Lists available commands, or detailed information about a specific command.',
            details: 'The command query must match the command or one of its aliases. If there is no command input, all available commands will be listed.',            
            format: 'help [command]',
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

    async run(message, { command }) {
        const groups = this.client.registry.groups
        const commands = this.client.registry.findCommands(command, true, message)
        const showAll = command && command.toLowerCase() === 'all'
        if(!command) {       
            let helpEmbed = util.embedify(
                'YELLOW',
                'Economica Commands',
                this.client.user.displayAvatarURL(),
                '',
                `Prefix: ${message.guild.commandPrefix}`
            )

            let commandList = ''
            for(const group of groups) {
                for(const command of group[1].commands) {
                    commandList += `\`${command[1].name}\`, `
                }

                //remove extraneous comma & space
                commandList = commandList.substring(0, commandList.length - 2)

                helpEmbed.addField(
                    group[1].name,
                    commandList,
                    true
                )
                commandList = ''
            }
            message.channel.send({ embed: helpEmbed })
        } else if (command && !showAll) {
            if (commands.length === 1) {
                let helpEmbed = util.embedify(
                    'YELLOW',
                    `${commands[0].name}`,
                    this.client.user.displayAvatarURL(),
                    `**${commands[0].description}**\n${commands[0].details ? commands[0].details : ''}`,
                    commands[0].guildOnly ? 'Only usable in servers.' : ''
                )
                if (commands[0].aliases.length) helpEmbed.addField(
                    'Aliases',
                    `\`${commands[0].aliases.toString().split(',').join('\n')}\``,
                    true,
                )
                if (commands[0].format) helpEmbed.addField(
                    'Format',
                    `\`${commands[0].format}\``,
                    true,
                )
                if (commands[0].examples) helpEmbed.addField(
                    'Examples',
                    `\`${commands[0].examples.toString().split(',').join(`\n`)}\``,
                    true,
                )
                
                message.channel.send({ embed: helpEmbed })
            } else {
                message.channel.send({ embed: util.embedify(
                    'RED', 
                    message.author.username, 
                    message.author.displayAvatarURL(), 
                    `Command \`${command}\` not found`
                    )
                }) 
            }
        }
    }
} 