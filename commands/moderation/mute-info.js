const Discord = require('discord.js')
const muteSchema = require('../../schemas/mute-sch')
const mongo = require('../../mongo')

module.exports = {
    aliases: ['muteinfo'],
    description: 'Returns information about a muted user',
    expectedArgs: '<@user> | <ID>',
    exUse: '796906750569611294',
    minArgs: 1,
    maxArgs: 1, 
    permissions: ['MUTE_MEMBERS'],
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
                const result = await muteSchema.findOne().sort({createdAt: -1})

                let muteEmbed= new Discord.MessageEmbed()
                muteEmbed
                .setAuthor(
                    `Mute information for ${target ? target.user.tag : id}`, 
                    target ? target.user.displayAvatarURL() : '')
                .addField('Mute status:', result.current ? 'True' : 'False')
                .addField('Server Member', inDiscord ? 'True' : 'False')
                .setColor(15105570)

                if(result.current) {

                    const date = new Date(result.createdAt)
                    const expirdate = new Date(result.expires)

                    muteEmbed
                        .addField('Muted on', `${date.toLocaleString()}`)
                        .addField('Muted by', `<@${result.staffID}>`)
                        .addField('Muted for', `${result.reason}`)
                        .addField('Mute expires', `${expirdate.toLocaleString()}`)
                }

                message.reply(muteEmbed)

            } finally {
                mongoose.connection.close()
            }
         })
    },
}