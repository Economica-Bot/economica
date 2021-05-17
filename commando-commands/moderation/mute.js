const { Command, CommandFormatError } = require('discord.js-commando')
const mongo = require('../../features/mongo')
const muteSchema = require('../../features/schemas/mute-sch')
const ms = require('ms')

module.exports = class MuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'moderation',
            guildOnly: true,
            memberName: 'mute',
            description: 'Mutes a user',
            details: 'This command requires a \`muted\` role (case INsensitive) with appropriate permissions. The length, if specified, must be in a format of minutes, hours, then days. This command only works on current member of your server. However, if a user leaves and comes back, the mute role will be automatically renewed.', 
            examples: [
                'mute <@user> [length] [reason]',
                'mute @Bob 10D',
                'mute @Bob spamming',
                'mute @Bob 5m ignoring rules'
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
                    key: 'member',
                    prompt: 'please @mention the member you wish to mute.',
                    type: 'member'
              ***REMOVED***
                {
                    key: 'args',
                    prompt: 'please provide a duration and a reason',
                    type: 'string',
                    default: 'No reason provided'
              ***REMOVED***
            ]
        })
    }

    async run(message, { member, args }) {

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

        await mongo().then(async (mongoose) => { 

            const prevMutes = await muteSchema.find({
                userID: member.id,
                guildID: guild.id
            })

            const currentlyMuted = prevMutes.filter(mute => {
                return mute.current === true
            })

            //test for multiple active mutes
            if(currentlyMuted.length) {
                return message.reply('That user is already muted')
            }

            const mutedRole = guild.roles.cache.find(role => {
                return role.name.toLowerCase() === 'muted'
            })
    
            if(!mutedRole) {
                return message.reply('Please create a "muted" role!')
            }
            
            let result = ''
            try {
                await member.send(`You have been muted in **${guild}** until **${expires}** for \`${reason}\``)
            } catch {
                result += `Could not dm ${member.user.tag}.`
            }
            member.roles.add(mutedRole)
    
            message.say(`Muted **${member.user.tag}** for \`${reason}\`. They will be unmuted on **${expires.toLocaleString()}**`)

            try {
                await new muteSchema({
                    userID: member.id,
                    guildID: guild.id,
                    reason,
                    staffID: staff.id,
                    staffTag: staff.tag,
                    expires,
                    current: true 
                }).save() 
                //console.log(`Mute Schema created: ${member.user.tag} in server ${guild} for "${reason}" until ${expires.toLocaleString()}`) 
            } finally {
                mongoose.connection.close()
            }
        })
    }
}