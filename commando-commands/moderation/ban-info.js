const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../features/mongo')
const banSchema = require('../../features/schemas/ban-sch')

const helper = require('../../features/helper')

module.exports = class BanInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'baninfo',
            group: 'moderation',
            guildOnly: true,
            memberName: 'baninfo',
            description: 'Returns the most recent ban information about a user',
            details: 'This command will work regardless of the user being a server member.',
            format: 'baninfo <@user | id | name>',
            examples: [
                'baninfo @bob',
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
                    prompt: 'please @mention, name, or provide the id of a user.',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    async run(message, { user }) {

        // Convert mention to id.
        let id = message.mentions.users.first() ? message.mentions.users.first().id : user

        const { guild } = message
        const member = guild.members.cache.get(id)

        if (typeof id == 'number') {
            id = helper.getUserIdByMatch(message, user).id
        }

        //checks if the member is a server member
        const inDiscord = !!member
        if(!inDiscord && !parseInt(id)) {
            return helper.errorEmbed(message, `${user} is not in this server! Please use their ID.`)
        }

        await mongo().then(async (mongoose) => {

            try {
                //find newest ban schema
                const result = await banSchema.findOne().sort({ createdAt: -1 })

                let banEmbed = new Discord.MessageEmbed()
                    .setAuthor(
                        `Ban information for ${member ? member.user.tag : id}`, member ? member.user.displayAvatarURL() : ''
                    )
                    .addField('Server Member', inDiscord ? 'True' : 'False')
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