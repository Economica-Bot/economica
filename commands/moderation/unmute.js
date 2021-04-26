const muteSchema = require('../../schemas/mute-sch')
const mongo = require('../../mongo')

module.exports = {
    aliases: ['unmute'],
    description: 'Unmutes a user',
    expectedArgs: '<@user> | <ID>',
    exUse: '@Bob',
    minArgs: 1,
    maxArgs: 1, 
    permissions: ['MUTE_MEMBERS'],
    callback: async (message, arguments, text) => {
        const target = message.mentions.users.first()
        const { guild } = message
        let id = ''

        if(target) {
        id = target.id
        } else {
            id = text
        }

        await mongo().then(async (mongoose) => {

            try {
                const result = await muteSchema.updateOne({
                    guildID: guild.id,
                    userID: id,
                    current: true
                }, {
                    current: false
                })
                console.log(`Unmuted ${id} in server ${guild}`)

            } finally {
                mongoose.connection.close()
            }
         })
    },
}