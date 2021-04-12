const Discord = require("discord.js");
const loadCommands = require('../load-cmnds')

module.exports = {
    commands: ['help', 'command', 'commands'],
    expectedArgs: ['none', '<cmd>'],
    exUse: 'help ping',
    description: 'Help menu',
    callback: (message, arguments, text) => {

        let reply = 'Supported Commands:\n\n'

        const commands = loadCommands()

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

        /*
        const fs = require('fs')
        let files = fs.readdirSync("commands");
        files.shift(); //gets rid of cmd-handler.js
        
        var nameList="";
        var argList="";
        var usageEx="";


        let result=files.forEach((f, i) => {
            let command=require(`./${f}`);
            helpEmbed.addFields (
                {
                   name:`${command.commands}`,
                   value:`Expected Arguments: ${command.expectedArgs}\nExample Usage: ${command.exUse}`
                } 
            )
            //(`** \n"Expected Arguments: "+${command.expectedArgs} \n"Example Usage: "+${command.exUse}`)  
        });
        message.channel.send(helpEmbed);

        //Embed Visualizer
        //https://leovoel.github.io/embed-visualizer/
        */
        
  ***REMOVED***
}