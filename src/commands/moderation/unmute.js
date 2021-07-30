const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const infractionSch = require('../../features/schemas/infraction-sch')

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
                'MANAGE_ROLES'
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
        
        //Remove muted role
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
        
        member.roles.remove(mutedRole)

        //Check if there is an active mute 
        const activeMutes = await infractionSch.find({
            userID: member.id,
            guildID: guild.id,
            type: "mute",
            active: true
        })  

        if (!activeMutes.length) {
            message.channel.send({ embed: util.embedify(
                'RED',
                member.user.tag, 
                member.user.displayAvatarURL(),
                `Could not find any active mutes for this user.`,
                member.user.id
            ) })

            return
        }

        message.channel.send({ embed: util.embedify(
            'GREEN',
            guild.name, 
            guild.iconURL(),
            `Unmuted <@!${member.user.id}>`, 
        ) })

        await infractionSch.updateMany({
            userID: member.id,
            guildID: guild.id,
            type: "mute",
            active: true
      ***REMOVED*** {
            active: false
        })
    }
}