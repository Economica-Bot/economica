const muteSchema = require('../../schemas/mute-sch')
const mongo = require('../../mongo')
const ms = require('../../node_modules/ms')

module.exports = {
    aliases: ['mute'],
    description: 'Mutes a user',
    expectedArgs: '<@user> <length> <reason>',
    exUse: '@Bob 10d Spamming',
    minArgs: 3,
    maxArgs: 10, 
    permissions: ['MUTE_MEMBERS'],
    callback: async (message, arguments, text) => {

        const { guild, author: staff } = message
        const target = message.mentions.users.first()
        const reason = text.split(" ").splice(2).join(' ')

        if(!target) return message.channel.send('User not found!')

        const mutedRole = guild.roles.cache.find(role => {
            return role.name.toLowerCase() === 'muted'
        })

        if(!mutedRole) {
            return message.reply ('Could not find a "muted" role!')
        }

        const targetMember = (await guild.members.fetch()).get(target.id)
        targetMember.roles.add(mutedRole)

        let duration = ms(arguments[1])
        const expires = new Date(new Date().getTime() + duration)

        await mongo().then(async (mongoose) => { 

            const prevMutes = await muteSchema.find({
            userID: target.id
            })

            const currentlyMuted = prevMutes.filter(mute => {
                return mute.current === true
            })

            //test for multiple active mutes
            if(currentlyMuted.length) {
                return message.reply('That user is already muted')
            }

            try {
                await new muteSchema({
                userID: target.id,
                guildID: guild.id,
                reason,
                staffID: staff.id,
                staffTag: staff.tag,
                expires,
                current: true 
                }).save() 
                console.log(`Created mutes Schema: Muted ${target.tag} in server ${guild} for "${reason}" until ${expires.toLocaleString()}`) 
            } finally {
                mongoose.connection.close()
            }
            return message.reply(`Muted <@${target.id}> for "${reason}". They will be unmuted on ${expires.toLocaleString()}`)
        })

    },
}