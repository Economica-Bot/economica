const { Command } = require('discord.js-commando')
const mongo = require('../../mongo')
const muteSchema = require('../../schemas/mute-sch')

module.exports = class UnMuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'moderation',
            guildOnly: true,
            memberName: 'unmute',
            description: 'Unmutes a user',
            details: 'This command requires a \`muted\` roles with respective permissions. The command only works on a current member of a server.',
            examples: [
                'unmute <@user>',
                'unmute @Bob'
            ],
            clientPermissions: [
                'MUTE_MEMBERS'
            ],
            userPermissions: [
                'MUTE_MEMBERS'
            ],
            argsCount: 1,
            args: [
                {
                    key: 'member',
                    prompt: 'please @mention the member you wish to unmute',
                    type: 'member'
                }
            ]
        })
    }

    async run(message, { member }) {
        
        const { guild } = message
        
        await mongo().then(async (mongoose) => {
            try {

                //Checks if there is an active mute 
                const prevMutes = await muteSchema.find({
                    userID: member.id,
                    guildID: guild.id
                })

                const currentlyMuted = prevMutes.filter(mute => {
                    return mute.current === true
                })

                if(!currentlyMuted.length) {
                    return message.reply('That user is not muted')
                }

                const result = await muteSchema.updateMany({
                    userID: member.id,
                    guildID: guild.id,
                    current: true
              ***REMOVED*** {
                    current: false
                })

                const mutedRole = guild.roles.cache.find(role => {
                    return role.name.toLowerCase() === 'muted'
                })

                if(result) {
                    member.roles.remove(mutedRole)
                    console.log(`Manually unmuted ${member.id} in server ${guild}.`)
                    if(result) message.say(`Unmuted user <@${member.id}>`)
                } else {
                    message.say(`<@${member.id}> could not be unmuted.`)
                }
            } finally {
                mongoose.connection.close()
            }
        })
    }
}