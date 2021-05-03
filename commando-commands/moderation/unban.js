const { Command } = require('discord.js-commando')
const mongo = require('../../mongo')
const banSchema = require('../../schemas/ban-sch')

module.exports = class unBanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            group: 'moderation',
            guildOnly: true,
            memberName: 'unban',
            description: 'Unbans a user',
            details: 'This command will unban a specified user.',
            examples: [ 'unban 796906750569611294' ],
            clientPermissions: [
                'BAN_MEMBERS'
            ],
            userPermissions: [
                'BAN_MEMBERS'
            ],
            argsSingleQuotes: false,
            args: [
                {
                    key: 'targetID',
                    prompt: 'please enter the I.D. of the user you wish to unban',
                    type: 'string'
                }
            ]
        }) 
    }

    async run(message, { targetID }) {
        const { guild } = message

        await mongo().then( async (mongoose) => {

            const bannedUser = (await guild.fetchBans()).get(targetID)

            if(bannedUser) {
                try {
                    const result = await banSchema.updateMany({
                        guildID: guild.id,
                        userID: targetID,
                        current: true,
                        expired: false,
                    }, {
                        current: true,
                        expired: true,
                    })

                    if(result) {
                        message.say(`Unbanned user ${targetID}`)
                        console.log(`Unbanned ${targetID} in server ${guild}`)
                    } 
                } finally {
                    mongoose.connection.close()
                }
            } else {
                message.say(`Could not find user ${targetID}`)
            }
        })
    }
}