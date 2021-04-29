const Discord = require('discord.js')
const banSchema = require('../../schemas/ban-sch')
const mongo = require('../../mongo')
const { db } = require('../../schemas/ban-sch')

module.exports = {
    aliases: ['baninfo'],
    description: 'Returns information about a banned user',
    expectedArgs: '<@user> | <ID>',
    exUse: '796906750569611294',
    minArgs: 1,
    maxArgs: 1, 
    permissions: ['BAN_MEMBERS'],
    callback: async (message, arguments, text) => {
        
        let id = text
        if(message.mentions.users.first()) {
            id = message.mentions.users.first().id
        }
        const { guild } = message

        const members = await guild.members.fetch()
        const target = members.get(id)

        message.channel.send(`Target: ${target}\nid: ${id}`)

        //checks if target is a server member
        const inDiscord = !!target

        await mongo().then(async (mongoose) => {

            try {
                const result = await banSchema.findOne().sort({createdAt: -1})

                let banEmbed= new Discord.MessageEmbed()
                banEmbed
                .setAuthor(
                    `Ban information for ${target ? target.user.tag : id}`, 
                    target ? target.user.displayAvatarURL() : '')
                .addField('Banned?', result.current ? 'True' : 'False')
                .addField('Server Member', inDiscord ? 'True' : 'False')
                .setColor(15105570)
                
                if(result.current) {
                    banEmbed
                        .addField('Banned on', `${new Date(result.createdAt)}`)
                        .addField('Banned by', `<@${result.staffID}>`)
                        .addField('Banned for', `${result.reason}`)
                } 

                message.reply(banEmbed)

            } finally {
                mongoose.connection.close()
            }
         })
  ***REMOVED***
}