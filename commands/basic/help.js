const Discord = require("discord.js")
const loadCommands = require('../load-cmnds')
const { prefix } = require('../../config.json')

module.exports = {
    commands: ['help', 'command', 'commands'],
    expectedArgs: ['none', '<cmd>'],
    maxArgs: 1,
    exUse: 'ping',
    description: 'The Help menu lists all commands and their descriptions',
    callback: (message, arguments, text) => {

        const commands = loadCommands()

        //Single-Command Help
        if(arguments[0]) {
            for(const command of commands) {
                for(const name of command.commands) {
                    if(arguments[0] == name) {
                        return message.channel.send({
                            embed: {
                                title: `${name}`,
                                color: 'GREEN',
                                description: `${command.description}\nExpected Arguments: \`${command.expectedArgs}\``
                            }
                        })
                    }
                }
            }
            return message.channel.send({
                embed: {
                        color: 'RED',
                        title: 'Command not Found',
                        description: `For a list of available commands, type \`${prefix}help\``
                }
            })
        }

        let helpEmbed= new Discord.MessageEmbed()
        helpEmbed
        .setTitle("Commands")
        .setFooter("Bugs? Too bad.")
        .setColor(15277667)
        .setThumbnail("https://cdn.discordapp.com/avatars/796906750569611294/34ba71dfc581a2662ec9ac250860b785.png?size=1024")
        .setTimestamp();

        for(const command of commands) {
            //Check perms
            let permissions = command.permission

            if(permissions) {
                let hasPermission = true
                if(typeof permissions === 'string') {
                    permissions = [permissions]
                }

                for(const permission of permissions) {
                    if(!message.member.hasPermission(permission)) {
                        hasPermission = false
                        break
                    }
                }

                if(!hasPermission) {
                    continue
                }
            }
            
            const mainCommand = 
                typeof command.commands === 'string'
                    ? command.commands
                    : command.commands[0]
            const args = command.expectedArgs
                ? ` ${command.expectedArgs}` : ''
            const {description} = command

            helpEmbed.addFields (
                {
                   name:`${mainCommand}`,
                   value:`Expected Arguments: ${args}\nDescription: ${description}`
                } 
            )
        }

        message.channel.send(helpEmbed)
        
  ***REMOVED***
}