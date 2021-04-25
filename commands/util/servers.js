const Discord = require("discord.js")

module.exports = {
    aliases: ['server', 'servers'],
    description: 'Lists servers and membercounts',
    callback: (message, arguments, text) => {
        const client = message.client

        let serverEmbed= new Discord.MessageEmbed()
        serverEmbed
        .setTitle("Server List")
        .setFooter("Bugs? Too bad.")
        .setColor(11274467)
        .setTimestamp();

        client.guilds.cache.forEach((guild) => {
            serverEmbed.addFields (
                {
                   name:`${guild}`,
                   value:`Member Count: ${guild.memberCount}`
                } 
            )
            message.channel.send(serverEmbed)
        })
  ***REMOVED***
}