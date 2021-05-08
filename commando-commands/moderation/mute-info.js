const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const mongo = require('../../mongo')
const muteSchema = require('../../schemas/mute-sch')

module.exports = class MuteInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'muteinfo',
            group: 'moderation',
            guildOnly: true,
            memberName: 'muteinfo',
            description: 'Returns information about a muted user', 
            details: 'The command will work regardless of the user being a member of the server or not.',
            usage: 'muteinfo <@user | id>',
            examples: [
                'muteinfo @Bob',
                'muteinfo 796906750569611294'
            ],
            clientPermissions: [
                'MUTE_MEMBERS'
            ],
            userPermissions: [
                'MUTE_MEMBERS'
            ],
            argsSingleQuotes: true,
            argsCount: 1,
            args: [
                {
                    key: 'user',
                    prompt: 'please @mention or provide the id of a user',
                    type: 'string'
                }
            ]

        })
    }

    async run(message, { user }) {

        //convert mention to id
        const id = message.mentions.users.first() ? message.mentions.users.first().id : user
        
        const { guild } = message
        const member = guild.members.cache.get(id)

        //checks if the member is a server member
        const inDiscord = !!member

        await mongo().then(async (mongoose) => {

            try{
                //find most recent mute schema
                const result = await muteSchema.findOne().sort({ createdAt: -1
                })

                if (result) {
                    let muteEmbed = new Discord.MessageEmbed()
                        .setAuthor(`Mute information for ${member ? member.user.tag : id}`, member ? member.user.displayAvatarURL() : '')
                        .addField('Mute status', result.current ? 'True' : 'False')
                        .addField('Server Member', inDiscord ? 'True' : 'False')
                        .setColor(15105570)

                    if (result.current) {

                        const expirdate = new Date(result.expires)

                        muteEmbed
                            .addField('Muted on', `${new Date(result.createdAt)}`)
                            .addField('Muted by', `<@${result.staffID}>`)
                            .addField('Muted for', `${result.reason}`)
                            .addField('Mute expires', `${expirdate.toLocaleString()}`)
                    }
                    message.say(muteEmbed)
                } else message.reply(`User ${member ? member.user.tag : id} has never been muted.`)

            } finally {
                mongoose.connection.close()
            }
        })

        
    }
}