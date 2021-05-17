const { Command } = require('discord.js-commando')
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
            format: 'kick <@user> [reason]',
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
                    key: 'member',
                    prompt: 'please @mention a user you wish to kick.',
                    type: 'member'
              ***REMOVED***
                {
                    key: 'reason',
                    prompt: 'please provide a reason for this kick',
                    type: 'string',
                    default: 'No reason provided'
                }
            ]
        })
    }

    async run(message, { member, reason }) {
        const { guild, author: staff } = message
        if(member.kickable) {
            let result = ''
            try {
                await member.send(`You have been kicked from **${guild}** for \`${reason}\``)
            } catch {
                result += `Could not dm ${member.user.tag}.`
            }
            member.kick({
                reason: reason
            })
            message.say(`${result}\nKicked ${member.user.tag} for \`${reason}\``)

            await mongo().then(async (mongoose) => {
                try {
                    await new kickSchema({
                        userID: member.id,
                        guildID: guild.id,
                        reason,
                        staffID: staff.id,
                        staffTag: staff.tag
                    }).save()
                    //console.log(`Kick Schema created: ${member.user.tag} in server ${guild} for "${reason}"`)
                } finally {
                    mongoose.connection.close()
                }
            })
        } else {
            message.say(`${member.user.tag} could not be kicked.`)
        }
    }
}