const { Command } = require('discord.js-commando')
const { MessageActionRow, MessageButton } = require('discord.js')

const mongo = require('../../features/mongo')
const infractionSch = require('../../features/schemas/infraction-sch')

const util = require('../../features/util')
const { oneLine } = require('common-tags')


module.exports = class InfractionInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'infractions',
            aliases: [
                'infraction'
            ],
            group: 'moderation',
            memberName: 'infractions',
            guildOnly: true,
            description: 'Displays information about a user\'s infractions',
            details: oneLine`Checks a user's presence in the guild, and displays previous warns, mutes, kicks, and bans. 
                            This command will work regardless of the user being a server member. 
                            Administrator only.`,
            format: '<@user | id | name>',
            examples: [
                'infractions @bob',
                'infractions 796906750569611294'
            ],
            userPermissions: [
                'ADMINISTRATOR'
            ],
            argsPromptLimit: 0,
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

        //checks if the user is a server member
        const inDiscord = !!member
        if(!inDiscord && !parseInt(user)) {
            message.channel.send({ embed: util.embedify('RED', 
            guild.name, 
            guild.iconURL(), 
            `\`${user}\` is not in this server! Please use their ID.`)
            })
            
            return 
        }

        //find latest infraction data
        const infractions = await infractionSch.find({
            guildID: guild.id, 
            userID: id
        }).sort({
            createdAt: -1
        })

        let infractionEmbed = util.embedify(
            'BLURPLE', 
            `${member ? member.user.tag : id}'s Infractions`, 
            member ? member.user.displayAvatarURL() : '',
            '',
            `${inDiscord ? `Server Member | Joined ${new Date(member.joinedTimestamp).toLocaleString()}` : 'Not a Server Member'}`
        )
        
        const row = new MessageActionRow()
        const infractionTypes = [
            {
                type: 'warn', formal: 'Warned', logo: 'Warns ⚠️', had: false
          ***REMOVED*** 
            {
                type: 'mute', formal: 'Muted', logo: 'Mutes 🎤', had: false
          ***REMOVED***
            {
                type: 'kick', formal: 'Kicked', logo: 'Kicks 👢', had: false
          ***REMOVED***
            {
                type: 'ban', formal: 'Banned', logo: 'Bans 🔨', had: false
            }
        ]

        for(const infraction of infractions) {
            if(infraction.type === 'warn') {
                const warn = infractionTypes.find(obj => obj.type === 'warn')
                warn.had = true
            } else if(infraction.type === 'mute') {
                const mute = infractionTypes.find(obj => obj.type === 'mute')
                mute.had = true
                if(infraction.active) {
                    infractionEmbed.addField(
                        `Currently **Muted**`,
                        `\`${infraction.reason}\``
                    )
                }
            } else if(infraction.type === 'kick') {
                const kick = infractionTypes.find(obj => obj.type === 'kick')
                kick.had = true
            } else if(infraction.type === 'ban') {
                const ban = infractionTypes.find(obj => obj.type === 'ban')
                ban.had = true
                if(infraction.active) {
                    infractionEmbed.addField(
                        `Currently **Banned**`,
                        `\`${infraction.reason}\``
                    )
                }
            }
        }

        let description = ''
        for(const infractionType of infractionTypes) {
            description += `**${infractionType.formal}** \`${infractions.filter((infraction) => infraction.type === infractionType.type).length}\` times\n`
            if(infractionType.had) {
                row.addComponents(
                    new MessageButton()
                        .setCustomID(`${infractionType.type}`)
                        .setLabel(`${infractionType.logo}`)
                        .setStyle(4)
                )
            }
        }

        infractionEmbed.setDescription(description)    

        //Add current mute/kick/ban/warn info
        const msg = {
            embed: infractionEmbed, 
        }
        if(row.components.length) {
            msg.components = [row] 
        }

        const interactee = await message.channel.send(msg)
        this.client.on('interaction', async interaction => {
            if(interaction.componentType === 'BUTTON' && interaction.message.id === interactee.id && interaction.user === message.author) {
                let title = '', description = ''
                infractions.forEach(infraction => {
                    if(infraction.type === interaction.customID) {
                        const infractionType = infractionTypes.filter(infractionType => infractionType.type === infraction.type)[0]
                        title = infractionType.logo
                        description += `${infractionType.formal} by <@!${infraction.staffID}> for \`${infraction.reason}\` ${infraction.type === 'mute' ? `${infraction.permanent ? '| **Permanent**' : `until **${new Date(infraction.expires).toLocaleString()}**`}` : ''}\n`
                    }
                })
                const specEmbed = util.embedify(
                    'BLURPLE',
                    `${member ? member.user.tag : id} | ${title}`,
                    member ? member.user.displayAvatarURL() : '',
                    description
                )
                interaction.update({
                    embeds: [specEmbed],
                    components: []
                })
            }
        })
    }
}