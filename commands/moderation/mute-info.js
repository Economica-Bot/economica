const Discord = require('discord.js')
const muteSchema = require('../../schemas/mute-sch')
const mongo = require('../../mongo')

module.exports = {
    aliases: ['muteinfo'],
    description: 'Returns information about a muted user',
    expectedArgs: '<ID>',
    exUse: '796906750569611294',
    minArgs: 1,
    maxArgs: 1, 
    permissions: ['MUTE_MEMBERS'],
    callback: async (message, arguments, text) => {
        const { guild } = message
        id = text

        const members = await guild.members.fetch()
        const target = members.get(id)

        //checks if target exists
        const inDiscord = !!target

        await mongo().then(async (mongoose) => {

            try {
                const result = await muteSchema.findOne({
                    guildID: guild.id,
                    userID: id,
                    current: true
                })

                let muteEmbed= new Discord.MessageEmbed()
                muteEmbed
                .setAuthor(
                    `Mute information for ${target ? target.user.tag : id}`, 
                    target ? target.user.displayAvatarURL() : '')
                .addField('Mute status:', result ? 'True' : 'False')
                .addField('Server Member', inDiscord ? 'True' : 'False')
                .setColor(15105570)

                if(result) {

                    const date = new Date(result.expires)

                    muteEmbed
                        .addField('Muted by', `<@${result.staffID}>`)
                        .addField('Muted for', `${result.reason}`)
                        .addField('Mute expires', `${date.toLocaleString()}`)
                }

                message.reply(muteEmbed)

            } finally {
                mongoose.connection.close()
            }
         })
    },
}