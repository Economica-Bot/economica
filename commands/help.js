const Discord = require("discord.js");

module.exports = {
    commands: ['help', 'command', 'commands'],
    expectedArgs: ['none', '<cmd>'],
    exUse: 'help ping',
    callback: (message, arguments, text) => {

        const fs = require('fs')
        let files = fs.readdirSync("commands");
        files.shift(); //gets rid of cmd-handler.js
        
        var nameList="";
        var argList="";
        var usageEx="";

        
        let helpEmbed= new Discord.MessageEmbed()
        helpEmbed
        .setTitle("Commands")
        .setFooter("Bugs? Too bad.")
        .setColor(15277667)
        .setThumbnail("https://cdn.discordapp.com/avatars/796906750569611294/34ba71dfc581a2662ec9ac250860b785.png?size=1024")
        .setTimestamp();

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
        
  ***REMOVED***
}