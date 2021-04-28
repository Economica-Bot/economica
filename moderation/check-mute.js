const muteSchema = require('../schemas/mute-sch')
const mongo = require('../mongo')

module.exports = client => {
    const checkMutes = async () => {
        console.log('Checking Mute Data')
        const now = new Date()

        const conditional = {
            expires: {
                $lt: now
          ***REMOVED***
            current: true
        }

        await mongo().then(async (mongoose) => { 
            try {
                var results = await muteSchema.find(conditional)
            } catch {
                console.log('No expired active mutes found')
                mongoose.connection.close()
                return
            }   

            //Unmute currently muted users
            if(results && results.length) {
                for (const result of results) {

                    const { guildID, userID } = result
                    const guild = client.guilds.cache.get(guildID)

                    try {
                        const member = (await guild.members.fetch()).get(userID)
    
                        const mutedRole = guild.roles.cache.find(role => {
                            return role.name.toLowerCase() === 'muted'
                        })
        
                        member.roles.remove(mutedRole)
                        console.log(`Unmuted <@${member.id}>`)

                        await muteSchema.updateMany(conditional, {
                            current: false,
                        })
                    } finally {
                        mongoose.connection.close()
                    }  
                } 
            }  
        })

        //checks for bans every 5 minutes
        setTimeout(checkMutes, 1000 * 60 * 5)
    }
    checkMutes()

    //checks if joining member currently muted
    client.on('guildMemberAdd', async member => {
        const { guild, id } = member
        const currentMute = await muteSchema.findOne({
            userID: id, 
            guildID: guild.id,
            current: true
        })

        if(currentMute) {
            const role = guild.roles.cache.find(role => {
                return role.name.toLowerCase() === 'muted'
            })

            if(role) {
                member.roles.add(role)
                console.log(`User <@${member.id}> rejoined ${guild} and was muted.`)
            }
        }
    })
}