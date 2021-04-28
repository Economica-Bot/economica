const mongo = require('../../mongo')
const banSchema = require('../../schemas/ban-sch')

module.exports = {
    aliases: ['ban'],
    description: 'Bans a user',
    expectedArgs: '<user> <reason>',
    exUse: '@Bob spamming',
    minArgs: 2,
    maxArgs: 10, 
    permissions: ['BAN_MEMBERS'],
    callback: async (message, arguments, text) => {

        const { guild, author: staff } = message
        const target = message.mentions.users.first();
        const reason = text.split(" ").splice(1).join(' ')
        
        if(target) {

            await mongo().then( async (mongoose) => {
                try {
                    await new banSchema({
                        userID: target.id,
                        guildID: guild.id,
                        reason,
                        staffID: staff.id,
                        staffTag: staff.tag,
                        current: true,
                        expired: false, 
                    }).save()
                } finally {
                    mongoose.connection.close()
                }
            })
            const targetMember = message.guild.members.cache.get(target.id)
            targetMember.ban()
            message.channel.send(`Banned user ${arguments[0]} for \`${reason}\``)
                
        } else {
            message.reply('Please specify someone to ban.')
        }

  ***REMOVED***
}