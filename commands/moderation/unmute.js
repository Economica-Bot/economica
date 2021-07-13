const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const mongo = require('../../features/mongo')
const muteSchema = require('../../features/schemas/mute-sch')

const { oneLine } = require('common-tags')

module.exports = class UnMuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'moderation',
            guildOnly: true,
            memberName: 'unmute',
            description: 'Unmutes a user',
            details: oneLine`This command requires a \`muted\` roles with respective permissions. 
                            This command only works on a current member of a server.`,
            format: '<@user | id | name>',
            examples: [
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
                    key: 'user',
                    prompt: 'Please @mention, name, or provide the id of a user.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { user }) {
        const { guild } = message
        let id = await util.getUserID(message, user)
        if(id === 'noMemberFound') return
        let member
        if(id != 'noIDMemberFound') {
            member = await message.guild.members.fetch(id)
        } else {
            return
        }

        await mongo().then(async (mongoose) => {
            try {

                //Check if there is an active mute 
                const activeMutes = await muteSchema.find({
                    userID: member.id,
                    guildID: guild.id,
                    active: true
                })  

                if (!activeMutes.length) {
                    return message.reply('That user is not muted')
                }

                const result = await muteSchema.updateMany({
                    userID: member.id,
                    guildID: guild.id,
                    active: true
              ***REMOVED*** {
                    active: false
                })

                const mutedRole = guild.roles.cache.find(role => {
                    return role.name.toLowerCase() === 'muted'
                })

                if (result) {
                    member.roles.remove(mutedRole)
                    message.channel.send(`Unmuted **${member.user.tag}**.`)
                } else {
                    message.channel.send(`**<@${member.id}>** could not be unmuted.`)
                }
            } finally {
                mongoose.connection.close()
            }
        })
    }
}