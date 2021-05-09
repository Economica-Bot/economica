const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const mongo = require('../../mongo')
const banSchema = require('../../schemas/ban-sch')

module.exports = class BanInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'baninfo',
            group: 'moderation',
            guildOnly: true,
            memberName: 'ban info',
            description: 'Returns ban information about a user', 
            details: 'The command will work regardless of the user being a member of the server or not.',
            examples: [
                'baninfo <@user | id>',
                'baninfo @Bob',
                'baninfo 796906750569611294'
            ],
            clientPermissions: [
                'BAN_MEMBERS'
            ],
            userPermissions: [
                'BAN_MEMBERS'
            ],
            argsCount: 1,
            args: [
                {
                    key: 'user',
                    prompt: 'please @mention or provide the ID of a user',
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
                //find newest ban schema
                const result = await banSchema.findOne().sort({ createdAt: -1 })

                let banEmbed = new Discord.MessageEmbed()
                    .setAuthor(
                        `Ban information for ${member ? member.user.tag : id}`, member ? member.user.displayAvatarURL() : ''
                    )
                    .addField('Server Member?', inDiscord ? 'True' : 'False')
                    .setColor(12345678)
                        
                if (result) {
                    banEmbed.addField('Ban Status', result.current ? 'True' : 'False')
                    if (result.current) {
                        banEmbed
                            .addField('Banned on', `${new Date(result.createdAt)}`)
                            .addField('Banned by', `${guild.members.cache.get(result.staffID)}`)
                            .addField('Banned for', `${result.reason}`)
                    }
                } else banEmbed.addField('Ban status', 'False')
                message.say(banEmbed)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}