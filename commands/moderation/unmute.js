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
                const result = await muteSchema.updateMany({
                    guildID: guild.id,
                    userID: id,
                    current: true
                }, {
                    current: false
                })

                const member = (await guild.members.fetch()).get(id)
    
                const mutedRole = guild.roles.cache.find(role => {
                    return role.name.toLowerCase() === 'muted'
                })
                member.roles.remove(mutedRole)
                
                console.log(`Manually unmuted ${id} in server ${guild}`)
                if(result) message.reply(`Unmuted user ${id}`)

            } finally {
                mongoose.connection.close()
            }
         })
    },
}