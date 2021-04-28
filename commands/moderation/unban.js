const banSchema = require('../../schemas/ban-sch')
const mongo = require('../../mongo')
const { Message } = require('discord.js')

module.exports = {
    aliases: ['unban'],
    description: 'Unbans a user',
    expectedArgs: '<ID>',
    exUse: '796906750569611294',
    minArgs: 1,
    maxArgs: 1, 
    permissions: ['BAN_MEMBERS'],
    callback: async (message, arguments, text) => {
        const { guild } = message
        const id = text

        await mongo().then(async (mongoose) => {

            const bannedUser = (await guild.fetchBans()).get(id)

            if(bannedUser) {
                try {
                    const result = await banSchema.updateMany({
                        guildID: guild.id,
                        userID: id,
                        current: true,  
                        expired: false,
                    }, {
                        current: true,
                        expired: true
                    })

                    console.log(`Unbanned ${id} in server ${guild}`)
                    if(result) message.reply(`Unbanned user ${id}`)

                } finally {
                    mongoose.connection.close()
                }
            } else {
                message.channel.send(`Could not find user ${id}`)
            }
         })
    },
}