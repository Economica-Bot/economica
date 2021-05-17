const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../features/mongo')
const muteSchema = require('../../features/schemas/mute-sch')

module.exports = class MuteInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'muteinfo',
            group: 'moderation',
            guildOnly: true,
            memberName: 'muteinfo',
            description: 'Returns the most recent mute information about a user', 
            details: 'This command will work regardless of the user being a server member.',
            format: 'muteinfo <@user | id>',
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

        //convert mention to id
        const id = message.mentions.users.first() ? message.mentions.users.first().id : user
        
        const { guild } = message
        const member = guild.members.cache.get(id)

        //checks if the member is a server member
        const inDiscord = !!member

        await mongo().then(async (mongoose) => {

            try {
                //find newest mute schema
                const result = await muteSchema.findOne().sort({ createdAt: -1})
                
                let muteEmbed = new Discord.MessageEmbed()
                    .setAuthor(`Mute information for ${member ? member.user.tag : id}`, member ? member.user.displayAvatarURL() : '')
                    .addField('Server Member', inDiscord ? 'True' : 'False')
                    .setColor(15105570)

                if (result) {
                    muteEmbed.addField('Mute Status', result.current ? 'True' : 'False')
                    if(result.current) {
                        const expirdate = new Date(result.expires)

                        muteEmbed
                            .addField('Muted on', `${new Date(result.createdAt)}`)
                            .addField('Muted by', `<@${result.staffID}>`)
                            .addField('Muted for', `${result.reason}`)
                            .addField('Mute expires', `${expirdate.toLocaleString()}`)
                    }
                } else muteEmbed.addField('Mute status', 'False')
                message.say(muteEmbed)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}