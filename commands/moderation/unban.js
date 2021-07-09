const { Command } = require('discord.js-commando')
const mongo = require('../../features/mongo')
const banSchema = require('../../features/schemas/ban-sch')

module.exports = class unBanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            group: 'moderation',
            memberName: 'unban',
            guildOnly: true,
            description: 'Unbans a user',
            format: '<id>',
            examples: [
                'unban 796906750569611294'
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
                    key: 'userID',
                    prompt: 'Please enter the ID of the user you wish to unban.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { userID }) {
        const { guild } = message
        await mongo().then(async (mongoose) => {
            const bannedUser = (await guild.bans.fetch()).get(userID)
            if (bannedUser) {
                try {
                    const results = await banSchema.updateMany({
                        guildID: guild.id,
                        userID,
                        active: true,
                  ***REMOVED*** {
                        active: false,
                    })

                    const bannedUser = (await guild.bans.fetch()).get(userID)
                    if (bannedUser) {
                        guild.bans.fetch().then(bans => {
                            guild.members.unban(userID)
                            console.log(`Unbanned ${userID} in server ${guild.name}`)
                            message.channel.send(`Unbanned user \`${userID}\``)
                        })
                    }
                } finally {
                    mongoose.connection.close()
                }
            } else {
                message.say(`Could not find user \`${userID}\`. Please use a valid ID.`)
            }
        })
    }
}