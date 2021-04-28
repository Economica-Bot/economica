const banSchema = require('../schemas/ban-sch')
const mongo = require('../mongo')
const { Message } = require('discord.js')

module.exports = client => {
    const checkBans = async () => {
        console.log('Checking Ban Data')

        const conditional = {
            current: true,
            expired: true
        }

        await mongo().then(async (mongoose) => {  
            try {
                var results = await banSchema.find(conditional)
            } catch {
                console.log('No expired banned users found.')
                mongoose.connection.close()
                return 
            }

            //Unban expired yet currently banned users
            if(results && results.length) {
                for(const result of results) {

                    const { guildID, userID } = result
                    const guild = client.guilds.cache.get(guildID)

                    try {
                        const bannedUser = (await guild.fetchBans()).get(userID)

                        if(bannedUser) {
                            console.log(`${userID} is currently banned.`)
                            guild.fetchBans().then( bans => {
                                guild.members.unban(userID)
                                console.log(`Unbanned <@${userID}>`)
                            })
                            await banSchema.updateMany(conditional, {
                                current: false,
                            })
                        }
                    } finally {
                        mongoose.connection.close()
                    }
                }
            } 
        })

        //checks for bans every 5 minutes
        setTimeout(checkBans, 1000 * 60 * 5)
    }
    checkBans()

}