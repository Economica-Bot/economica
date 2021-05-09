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
            examples: [ 
                'unban 796906750569611294' 
            ],
            clientPermissions: [
                'BAN_MEMBERS'
            ],
            userPermissions: [
                'BAN_MEMBERS'
            ],
            args: [
                {
                    key: 'userID',
                    prompt: 'please enter the I.D. of the user you wish to unban',
                    type: 'string'
                }
            ]
        }) 
    }

    async run(message, { userID }) {
        const { guild } = message

        await mongo().then( async (mongoose) => {

            const bannedUser = (await guild.fetchBans()).get(userID)

            if(bannedUser) {
                try {
                    const result = await banSchema.updateMany({
                        guildID: guild.id,
                        userID: userID,
                        current: true,
                        expired: false,
                  ***REMOVED*** {
                        current: true,
                        expired: true,
                    })

                    if(result) {
                        message.say(`Unbanned user ${userID}`)
                        console.log(`Unbanned ${userID} in server ${guild}`)
                    } 
                } finally {
                    mongoose.connection.close()
                }
            } else {
                message.say(`Could not find user ${userID}`)
            }
        })
    }
}