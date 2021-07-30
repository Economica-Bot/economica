const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const infractionSchema = require('../../features/schemas/infraction-sch')

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

        if (!member.kickable) { 
            message.channel.send({ embed: util.embedify(
                'RED',
                member.user.tag, 
                member.user.displayAvatarURL(),
                `Unable to be kicked.`,
                member.user.id
            ) })
        }

        //Kick, record, and send message    
        await member.send({ embed: util.embedify(
            'RED',
            guild.name, 
            guild.iconURL(),
            `You have been **kicked** for \`${reason}\`.`
        ) }).catch((err) => {
            result = `Could not dm ${member.user.tag}.\n\`${err}\``
        })

        message.channel.send({ embed: util.embedify(
            'GREEN',
            `Kicked ${member.user.tag}`, 
            member.user.displayAvatarURL(),
            `**Reason**: \`${reason}\``,
            result ? result : member.user.id
        ) })
        
        member.kick({
            reason
        })

        await new infractionSchema({
            guildID: guild.id,
            userID: member.id,
            userTag: member.user.tag, 
            staffID: staff.id,
            staffTag: staff.tag,
            type: this.name,
            reason,
        }).save()
    }
}