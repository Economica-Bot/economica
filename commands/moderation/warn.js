const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const mongo = require('../../features/mongo')
const warnSch = require('../../features/schemas/warn-sch')

module.exports = class WarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'moderation',
            guildOnly: true,
            memberName: 'warn',
            description: 'Warn a user.',
            format: '<@user | id | name> [reason]',
            examples: [
                'warn @Bob Ignoring rules',
                'warn 796906750569611294'
            ],
            clientPermissions: [
                'MUTE_MEMBERS'
            ],
            userPermissions: [
                'MUTE_MEMBERS'
            ],
            argsType: 'multiple', 
            argsCount: 2,
            args: [
                {
                    key: 'user',
                    prompt: 'Please name the member you wish to warn.',
                    type: 'string'
              ***REMOVED*** 
                {
                    key: 'reason',
                    prompt: 'Please provide a reason',
                    type: 'string',
                    default: 'No reason provided'
                }
            ]
        })
    }

    async run(message, { user, reason }) {
        const { guild, author: staff } = message
        let id = await util.getUserID(message, user)
        if(id === 'noMemberFound') return
        let member
        if(id != 'noIDMemberFound') {
            member = await message.guild.members.fetch(id)
        } else {
            message.reply(`\`${user}\` is not a server member.`)
            return
        }

        message.channel.send(`Warned **${member.user.tag}** for \`${reason}\``)

        await mongo().then(async (mongoose) => {
            try {
                await new warnSch({
                    guildID: guild.id, 
                    userID: member.id, 
                    userTag: member.user.tag, 
                    staffID: staff.id, 
                    staffTag: staff.tag, 
                    reason
                }).save()
            } catch(err) {
                console.error(err)
            } finally {
                mongoose.connection.close()
            }                              
        })
    }
}