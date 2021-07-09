const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const mongo = require('../../features/mongo')
const kickSchema = require('../../features/schemas/kick-sch')

module.exports = class KickCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'moderation',
            guildOnly: true,
            memberName: 'kick',
            description: 'Kicks a user',
            format: '<@user | id | name> [reason]',
            examples: [
                'kick @bob',
                'kick @bob Spamming'
            ],
            clientPermissions: [
                'KICK_MEMBERS'
            ],
            userPermissions: [
                'KICK_MEMBERS'
            ],
            argsType: 'multiple',
            argsCount: 2,
            args: [
                {
                    key: 'user',
                    prompt: 'Please @mention, name, or provide the id of a user.',
                    type: 'string'
              ***REMOVED***
                {
                    key: 'reason',
                    prompt: 'Please provide a reason.',
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

        if (member.kickable) {
            let result = ''
            try {
                await member.send(`You have been kicked from **${guild}** for \`${reason}\`.`)
            } catch {
                result += `Could not dm **${member.user.tag}**.`
            }
            
            member.kick({
                reason: reason
            })
            message.channel.send(`${result}\nKicked **${member.user.tag}** for \`${reason}\`.`)

            await mongo().then(async (mongoose) => {
                try {
                    await new kickSchema({
                        guildID: guild.id,
                        userID: member.id,
                        userTag: member.user.tag, 
                        staffID: staff.id,
                        staffTag: staff.tag,
                        reason,
                    }).save()
                } finally {
                    mongoose.connection.close()
                }
            })
        } else {
            message.channel.send(`**${member.user.tag}** could not be kicked.`)
        }
    }
}