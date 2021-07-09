const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const mongo = require('../../features/mongo')
const banSchema = require('../../features/schemas/ban-sch')

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'moderation',
            guildOnly: true,
            memberName: 'ban',
            description: 'Bans a user',
            details: 'This command will ban a specified user and record details about the ban.',
            format: '<@user | id | name> [reason]',
            examples: [
                'ban @bob',
                'ban @bob Spamming'
            ],
            clientPermissions: [
                'BAN_MEMBERS'
            ],
            userPermissions: [
                'BAN_MEMBERS'
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

        if (member.bannable) {
            let result = ''
            try {
                await member.send(`You have been banned from **${guild}** for \`${reason}\``)
            } catch {
                result += `Could not dm ${member.user.tag}.`
            }

            member.ban({
                reason
            })
            message.say(`${result}\nBanned user ${member} for \`${reason}\``)

            await mongo().then(async (mongoose) => {
                try {
                    await new banSchema({
                        guildID: guild.id,
                        userID: member.id,
                        userTag: member.user.tag, 
                        staffID: staff.id,
                        staffTag: staff.tag,
                        reason,
                        active: true,
                    }).save()
                } finally {
                    mongoose.connection.close()
                }
            })
        } else {
            message.say(`${member.user.tag} could not be banned.`)
        }
    }
}