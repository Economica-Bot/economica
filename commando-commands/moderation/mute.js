const { Command, CommandFormatError } = require('discord.js-commando')
const mongo = require('../../mongo')
const muteSchema = require('../../schemas/mute-sch')
const ms = require('ms')

module.exports = class MuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'moderation',
            guildOnly: true,
            memberName: 'mute',
            description: 'Mutes a user',
            details: 'This command requires a \`muted\` role with respective permissions. The length, if specified, must be in a format of minutes, hours, then days. This command only works on current member of your server. If a user leaves and comes back, the mute role will be automatically renewed.',
            usage: 'mute <@user> [length] [reason]',
            clientPermissions: [
                'MUTE_MEMBERS'
            ],
            userPermissions: [
                'MUTE_MEMBERS'
            ],
            argsSingleQuotes: true,
            argsType: 'multiple',
            argsCount: 2, 
            args: [
                {
                    key: 'target',
                    prompt: 'please @mention the member you wish to mute',
                    type: 'member'
                },
                {
                    key: 'args',
                    prompt: 'Add a duration and a reason',
                    type: 'string',
                    default: 'No reason provided'
                },
            ]
        })
    }

    async run(message, {target, args}) {

        const { guild, author: staff } = message

        const args1 = args.split(" ")

        //ensure that second argument is a date
        let duration = ms(args1[0])

        if(duration) {
            var expires = new Date(new Date().getTime() + duration)
            var reason = args1.length > 1 ? args.substring(args.indexOf(' ') + 1) : 'No reason provided'
        } 
        //If second argument is not a date, mute is set to an arbitrary date, eons away
        else {
            var expires = new Date('January 1, 69420')
            var reason = args1.length ? args : 'No reason provided'
        }

       const mutedRole = guild.roles.cache.find(role => {
            return role.name.toLowerCase() === 'muted'
        })

        if(!mutedRole) {
            return message.reply('Please create a "muted" role!')
        }

        target.roles.add(mutedRole)

        await mongo().then(async (mongoose) => { 

            const prevMutes = await muteSchema.find({
                userID: target.id,
                guildID: guild.id
            })

            const currentlyMuted = prevMutes.filter(mute => {
                return mute.current === true
            })

            //test for multiple active mutes
            if(currentlyMuted.length) {
                return message.reply('That user is already muted')
            }

            try {
                await new muteSchema({
                userID: target.id,
                guildID: guild.id,
                reason,
                staffID: staff.id,
                staffTag: staff.tag,
                expires,
                current: true 
                }).save() 
                console.log(`Muted ${target.user.tag} in server ${guild} for "${reason}" until ${expires.toLocaleString()}`) 
            } finally {
                mongoose.connection.close()
            }
            return message.say(`Muted <@${target.user.tag}> for \`${reason}\`. They will be unmuted on ${expires.toLocaleString()}`)
        })
    }
}