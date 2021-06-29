const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../features/mongo')
const muteSchema = require('../../features/schemas/mute-sch')
const kickSchema = require('../../features/schemas/kick-sch')
const banSchema = require('../../features/schemas/ban-sch')

const helper = require('../../features/helper')


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
            details: 'Checks a user\'s presence in the guild, and displays previous mutes, kicks, and bans. This command will work regardless of the user being a server member. Administrator only.',
            format: 'infractions <@user | id | name>',
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
            argsCount: 1,
            args: [
                {
                    key: 'user',
                    prompt: 'please @mention, name, or provide the id of a user.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { user }) {

        //convert the mention to an id
        const id = message.mentions.users.first() ? message.mentions.users.first().id : user

        const { guild } = message
        const member = guild.members.cache.get(id)

        if (typeof id == 'number') {
            id = helper.getUserIdByMatch(message, user).id
        }

        //checks if the user is a server member
        const inDiscord = !!member
        if(!inDiscord && !parseInt(id)) {
            return helper.errorEmbed(message, `${user} is not in this server! Please use their ID.`)
        }

        await mongo().then(async (mongoose) => {

            //find latest infraction data
            try {
                const muteResults = await muteSchema.find().sort({ createdAt: -1 })
                const kickResults = await kickSchema.find().sort({ createdAt: -1 })
                const banResults = await banSchema.find().sort({ createdAt: -1 })

                let infractionEmbed = new Discord.MessageEmbed()
                    .setAuthor(
                        `Infraction information for ${member ? member.user.tag : id}`,
                        member ? member.user.displayAvatarURL() : ''
                    )
                    .addField('Server Member', inDiscord ? 'True' : 'False')
                    .setColor(15105570)

                for (const muteResult of muteResults) {
                    infractionEmbed
                        .addField(
                            'Muted',
                            `Muted on ${new Date(muteResult.createdAt).toLocaleDateString()} by ${muteResult.staffTag} for \`${muteResult.reason}\``
                        )
                }
                for (const kickResult of kickResults) {
                    infractionEmbed
                        .addField(
                            'Kicked',
                            `Kicked on ${new Date(kickResult.createdAt).toLocaleDateString()} by ${kickResult.staffTag} for \`${kickResult.reason}\``
                        )
                }
                for (const banResult of banResults) {
                    infractionEmbed
                        .addField(
                            'Banned',
                            `Banned on ${new Date(banResult.createdAt).toLocaleDateString()} by ${banResult.staffTag} for \`${banResult.reason}\``
                        )
                }
                message.say(infractionEmbed)

            } catch (err) {
                console.log(err)
                mongoose.connection.close()
            }
        })
    }
}