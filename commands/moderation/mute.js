const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const mongo = require('../../features/mongo')
const muteSchema = require('../../features/schemas/mute-sch')

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
        let id = await util.getUserID(message, user)
        if(id === 'noMemberFound') return
        let member
        if(id != 'noIDMemberFound') {
            member = await message.guild.members.fetch(id)
        } else {
            message.reply(`\`${user}\` is not a server member.`)
            return
        }

        let reason, expires, permanent
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

        await mongo().then(async (mongoose) => {
            
            //test for active mute
            const activeMutes = await muteSchema.find({
                guildID: guild.id,
                userID: member.id,
                active: true
            })

            if (activeMutes.length) {
                message.reply(`${member} is already muted.`)
                mongoose.connection.close()
                return 
            }

            const mutedRole = guild.roles.cache.find(role => {
                return role.name.toLowerCase() === 'muted'
            })

            if (!mutedRole) {
                message.reply('Please create a \`muted\` role!')
                return 
            }

            let result
            try {
                await member.send({ embed: util.embedify(
                    'RED',
                    guild.name, 
                    guild.iconURL(),
                    `You have been **muted** ${duration ? `for ${ms(duration)}` : 'permanently.'}\nReason: \`${reason}\``
                ) })
            } catch(err) {
                result = `Could not dm ${member.user.tag}.\n${err}`
            }

            member.roles.add(mutedRole)
            message.channel.send({ embed: util.embedify(
                'GREEN',
                member.user.tag, 
                member.user.displayAvatarURL(),
                `**Muted** ${duration ? `for ${ms(duration)}` : 'permanently.'}\nReason: \`${reason}\``,
                result
            ) })

            //message.channel.send(`Muted **${member.user.tag}** for \`${reason}\`. ${expires ? `They will be unmuted on ${expires.toLocaleString()}` : ''}`)
            try {
                await new muteSchema({
                    guildID: guild.id,
                    userID: member.id,
                    userTag: member.user.tag,
                    staffID: staff.id,
                    staffTag: staff.tag,
                    reason,
                    permanent, 
                    active: true,
                    expires,
                }).save()
            } finally {
                mongoose.connection.close()
            }
        })
    }
}