const { Command } = require('discord.js-commando')
const { MessageActionRow, MessageButton } = require('discord.js')

const mongo = require('../../features/mongo')
const muteSchema = require('../../features/schemas/mute-sch')
const kickSchema = require('../../features/schemas/kick-sch')
const banSchema = require('../../features/schemas/ban-sch')
const warnSchema = require('../../features/schemas/warn-sch')

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
            details: oneLine`Checks a user's presence in the guild, and displays previous mutes, kicks, and bans. 
                            This command will work regardless of the user being a server member. 
                            Administrator only.`,
            format: '<@user | id | name>',
            examples: [
                'infractions @bob',
                'infractions 796906750569611294'
            ],
            clientPermissions: [
                'ADMINISTRATOR'
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
        let id = await util.getUserID(message, user)
        if(id === 'noMemberFound') return
        let member = null
        if(id != 'noIDMemberFound') {
            member = await guild.members.fetch(id)
        } else {
            id = user
        }

        //checks if the user is a server member
        const inDiscord = !!member
        if(!inDiscord && !parseInt(user)) {
            message.channel.send({ embed: 
                util.embedify('RED', guild.name, guild.iconURL(), `\`${user}\` is not in this server! Please use their ID.`)
            })
            return 
        }

        await mongo().then(async (mongoose) => {

            //find latest infraction data
            try {
                const warnResults = await warnSchema.find({ userID: `${id}`, guildID: `${guild.id}` }).sort({ createdAt: -1 })
                const muteResults = await muteSchema.find({ userID: `${id}`, guildID: `${guild.id}` }).sort({ createdAt: -1 })
                const kickResults = await kickSchema.find({ userID: `${id}`, guildID: `${guild.id}` }).sort({ createdAt: -1 })
                const banResults = await banSchema.find({ userID: `${id}`, guildID: `${guild.id}` }).sort({ createdAt: -1 })
                let infractionEmbed = util.embedify(
                    'BLURPLE', 
                    `${member ? member.user.tag : id}'s Infractions`, 
                    member ? member.user.displayAvatarURL() : '',
                    '',
                    `${inDiscord ? `Server Member | Joined ${new Date(member.joinedTimestamp).toLocaleString()}` : 'Not a Server Member'}`
                )
                
                if(muteResults[0]?.active) {
                    infractionEmbed.addField(
                        'Currently Muted',
                        `\`${muteResults[0].reason}\``
                    )
                } if(banResults[0]?.active) {
                    infractionEmbed.addField(
                        'Currently Banned',
                        `\`${banResults[0].reason}\``
                    )
                }

                infractionEmbed.addFields([
                    {
                        name: 'Warned',
                        value: `\`${warnResults.length}\` times`,
                        inline: true
                  ***REMOVED***
                    {
                        name :'Muted',
                        value: `\`${muteResults.length}\` times`,
                        inline: true
                  ***REMOVED***
                    {
                        name: 'Kicked',
                        value: `\`${kickResults.length}\` times`,
                        inline: true
                  ***REMOVED***
                    {
                        name: 'Banned',
                        value: `\`${banResults.length}\` times`,
                        inline: true
                  ***REMOVED***
                ])
                
                const row = new MessageActionRow()
                if(warnResults.length) {
                    row.addComponents(
                        new MessageButton()
                            .setCustomID('warn_button')
                            .setLabel('Warns ⚠')
                            .setStyle(1)
                    )
                } if(muteResults.length) {
                    row.addComponents(
                        new MessageButton()
                            .setCustomID('mute_button')
                            .setLabel('Mutes 🎤')
                            .setStyle(1)
                    )
                } if(kickResults.length) {
                    row.addComponents(
                        new MessageButton()
                            .setCustomID('kick_button')
                            .setLabel('Kicks 👢')
                            .setStyle(2)
                    )
                } if(banResults.length) {
                    row.addComponents(
                        new MessageButton()
                            .setCustomID('ban_button')
                            .setLabel('Bans 🔨')
                            .setStyle(3)
                    )
                }

                //Add current mute/kick/ban/warn info
                const msg = {
                    embed: infractionEmbed, 
                }
                if(row.components.length) {
                    msg.components = [row] 
                }

                const interactee = await message.channel.send(msg)
                this.client.on('interaction', async interaction => {
                    if(interaction.componentType === 'BUTTON' && interaction.message.id === interactee.id) {
                        if (interaction.customID === 'warn_button') {
                            const warnEmbed = util.embedify(
                                'BLURPLE',
                                `Warns for ${member ? member.user.tag : id}`,
                                member ? member.user.displayAvatarURL() : '',
                            )
                            for(const warnResult of warnResults) {
                                warnEmbed.addField(
                                    `Warned on ${new Date(warnResult.createdAt).toLocaleString()}`,
                                    `Warned by \`${warnResult.staffTag}\` for \`${warnResult.reason}\``
                                )
                            }
                            interaction.update({
                                embeds: [warnEmbed],
                                components: []
                            }).catch(err => {
                                //console.error(err)
                            })
                        } else if(interaction.customID === 'mute_button') {
                            const muteEmbed = util.embedify(
                                'BLURPLE',
                                `Mutes for ${member ? member.user.tag : id}`,
                                member ? member.user.displayAvatarURL() : '',
                            )
                            for(const muteResult of muteResults) {
                                muteEmbed.addField(
                                    `Muted on ${new Date(muteResult.createdAt).toLocaleString()}`,
                                    `Muted by \`${muteResult.staffTag}\` for \`${muteResult.reason}\`. Expired ${new Date(muteResult.expires).toLocaleString()}`
                                )
                            }
                            interaction.update({
                                embeds: [muteEmbed],
                                components: []
                            }).catch(err => {
                                //console.error(err)
                            })
                        } else if (interaction.customID === 'kick_button') {
                            const kickEmbed = util.embedify(
                                'BLURPLE',
                                `Kicks for ${member ? member.user.tag : id}`,
                                member ? member.user.displayAvatarURL() : '',
                            )
                            for(const kickResult of kickResults) {
                                kickEmbed.addField(
                                    `Kicked on ${new Date(kickResult.createdAt).toLocaleString()}`,
                                    `Kicked by \`${kickResult.staffTag}\` for \`${kickResult.reason}\``
                                )
                            }
                            interaction.update({
                                embeds: [kickEmbed],
                                components: []
                            }).catch(err => {
                                //console.error(err)
                            })
                        } else if (interaction.customID === 'ban_button') {
                            const banEmbed = util.embedify(
                                'BLURPLE',
                                `Bans for ${member ? member.user.tag : id}`,
                                member ? member.user.displayAvatarURL() : '',
                            )
                            for(const banResult of banResults) {
                                banEmbed.addField(
                                    `Banned on ${new Date(banResult.createdAt).toLocaleString()}`,
                                    `Banned by \`${banResult.staffTag}\` for \`${banResult.reason}\``
                                )
                            }
                            interaction.update({
                                embeds: [banEmbed],
                                components: []
                            }).catch(err => {
                                //console.error(err)
                            })
                        }
                    }
                })
            } catch (err) {
                console.log(err)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}