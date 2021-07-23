const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const infractionSch = require('../../features/schemas/infraction-sch')

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
        let member, result, id = await util.getUserID(message, user)
        if(id === 'noMemberFound') {
            return
        } if(id != 'noIDMemberFound') {
            member = await message.guild.members.fetch(id)
        } else {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL(),
                `\`${user}\` is not a server member.`
            ) })

            return
        }

        //Kick, record, and send message    
        await member.send({ embed: util.embedify(
            'RED',
            guild.name, 
            guild.iconURL(),
            `You have been **warned** for \`${reason}\`.`
        ) }).catch((err) => {
            result = `Could not dm ${member.user.tag}.\n\`${err}\``
        })

        message.channel.send({ embed: util.embedify(
            'GREEN',
            `Warned ${member.user.tag}`, 
            member.user.displayAvatarURL(),
            `**Reason**: \`${reason}\``,
            result ? result : member.user.id
        ) })

        await new infractionSch({
            guildID: guild.id, 
            userID: member.id, 
            userTag: member.user.tag, 
            staffID: staff.id, 
            staffTag: staff.tag, 
            type: this.name,
            reason
        }).save()
    }
}