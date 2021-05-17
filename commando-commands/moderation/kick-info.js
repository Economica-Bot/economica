const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../features/mongo')
const kickSchema = require('../../features/schemas/kick-sch')

module.exports = class KickInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'kickinfo',
            group: 'moderation',
            guildOnly: true,
            memberName: 'kickinfo',
            description: 'Returns the most recent kick information about a user',
            details: 'This command will work regardless of the user being a server member.',
            format: 'kickinfo <@user | id>',
            examples: [
                'kickinfo @Bob',
                'kickinfo 796906750569611294'
            ],
            clientPermissions: [
                'KICK_MEMBERS'
            ],
            userPermissions: [
                'KICK_MEMBERS'
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
                //find newest kick schema
                const result = await kickSchema.findOne().sort({ createdAt: -1})

                let kickEmbed = new Discord.MessageEmbed()
                    .setAuthor(`Kick information for ${member ? member.user.tag : id}`, member ? member.user.displayAvatarURL() : '')
                    .addField('Server Member', inDiscord ? 'True' : 'False')
                    .setColor(15105570)

                if(result && !inDiscord) {
                    kickEmbed
                        .addField('Kicked on', `${new Date(result.createdAt)}`)
                        .addField('Kicked by', `<@${result.staffID}>`)
                        .addField('Kicked for', `${result.reason}`)
                } 
                message.say(kickEmbed)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}