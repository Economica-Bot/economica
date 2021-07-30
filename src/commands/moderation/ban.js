const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const infractionSchema = require('../../features/schemas/infraction-sch')

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'moderation',
            guildOnly: true,
            memberName: 'ban',
            description: 'Bans a user',
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
        let member, result, id = await util.getUserID(message, user)
        if(id === 'noMemberFound') {
            return
        } if(id != 'noIDMemberFound') {
            member = await message.guild.members.fetch(id)
        } else {
            message.reply(`\`${user}\` is not a server member.`)
            return
        }

        if (!member.bannable) { 
            message.channel.send({ embed: util.embedify(
                'RED',
                member.user.tag, 
                member.user.displayAvatarURL(),
                `Unable to be banned.`,
                member.user.id
            ) })
        }

        //Ban, record, and send message
        await member.send({ embed: util.embedify(
            'RED',
            guild.name, 
            guild.iconURL(),
            `You have been **banned** for \`${reason}\`.`
        ) }).catch((err) => {
            result = `Could not dm ${member.user.tag}.\n\`${err}\``
        })

        message.channel.send({ embed: util.embedify(
            'GREEN',
            `Banned ${member.user.tag}`, 
            member.user.displayAvatarURL(),
            `**Reason**: \`${reason}\``,
            result ? result : member.user.id
        ) })

        member.ban({
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
            active: true,
        }).save()
    }
}