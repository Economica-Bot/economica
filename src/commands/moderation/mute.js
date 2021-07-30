const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const infractionSch = require('../../features/schemas/infraction-sch')

const { oneLine } = require('common-tags')
const ms = require('ms')

module.exports = class MuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'moderation',
            guildOnly: true,
            memberName: 'mute',
            description: 'Mutes a user',
            details: oneLine`This command requires a \`muted\` role (case INsensitive) with appropriate permissions. 
                            The length, if specified, must be in a format of minutes, hours, then days. 
                            This command only works on current member of your server. 
                            If a user leaves and comes back, the mute role will be automatically renewed.`,
            format: '<@user | id | name> [length] [reason]',
            examples: [
                'mute @Bob 1m2h3d',
                'mute Bob spamming',
                'mute 796906750569611294 5m ignoring rules'
            ],
            clientPermissions: [
                'MANAGE_ROLES'
            ],
            userPermissions: [
                'MUTE_MEMBERS'
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
                    key: 'args',
                    prompt: 'Please provide a duration and a reason',
                    type: 'string',
                    default: 'No reason provided'
              ***REMOVED***
            ]
        })
    }

    async run(message, { user, args }) {
        const { guild, author: staff } = message
        let member, id = await util.getUserID(message, user)
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

        let reason, expires, permanent, result
        const args1 = args.split(" ")

        //Check if second argument is a date
        let duration = ms(args1[0])
        if (duration) {
            permanent = false
            expires = new Date(new Date().getTime() + duration)
            reason = args1.length > 1 ? args.substring(args.indexOf(' ') + 1) : 'No reason provided'
        }

        //If second argument is not a date, mute is set to permanent
        else {
            permanent = true
            reason = args1.length ? args : 'No reason provided'
        }

        //Check for mute role
        const mutedRole = guild.roles.cache.find(role => {
            return role.name.toLowerCase() === 'muted'
        })

        if (!mutedRole) {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL(),
                'Please create a `muted` role!',
                'Case insensitive.'
            ) })

            return 
        }
            
        //Check for active mute
        const activeMutes = await infractionSch.find({
            guildID: guild.id,
            userID: member.id,
            type: this.name, 
            active: true
        })

        if (activeMutes.length) {
            message.channel.send({ embed: util.embedify(
                'RED',
                member.user.tag, 
                member.user.displayAvatarURL(),
                `This user is already \`muted\`!`,
                member.user.id
            ) })

            return 
        }

        //Mute, record, and send message
        await member.send({ embed: util.embedify(
            'RED',
            guild.name, 
            guild.iconURL(),
            `You have been **muted** ${duration ? `for ${ms(duration)}` : 'permanently.'}\nReason: \`${reason}\``
        ) }).catch((err) => {
            result = `Could not dm ${member.user.tag}.\n\`${err}\``
        })

        message.channel.send({ embed: util.embedify(
            'GREEN',
            `Muted ${member.user.tag}`, 
            member.user.displayAvatarURL(),
            `**Reason**: \`${reason}\`\n**Length**: \`${duration ? `${ms(duration)}` : 'permanent'}\``,
            result ? result : member.user.id
        ) })

        member.roles.add(mutedRole)

        await new infractionSch({
            guildID: guild.id,
            userID: member.id,
            userTag: member.user.tag,
            staffID: staff.id,
            staffTag: staff.tag,
            type: this.name, 
            reason,
            permanent, 
            active: true,
            expires,
        }).save()
    }
}