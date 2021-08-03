const economySchema = require('../../util/mongo/schemas/economy-sch')
const marketItemSchema = require('../../util/mongo/schemas/market-item-sch')
const inventorySchema = require('../../util/mongo/schemas/inventory-sch')

module.exports = {
    name: 'purge',
    group: 'market',
    description: 'Delete economy-related content on the server',
    format: '<inventory | market | balance>',
    global: true, 
    permissions: [
        'ADMINISTRATOR'
    ],
    options: [
        {
            name: 'inventory',
            description: 'Delete inventory content.',
            type: 1, //SUB_COMMAND
            options: null
      ***REMOVED***
        {
            name: 'market',
            description: 'Delete market content.',
            type: 1,
            options: null
      ***REMOVED***
        {
            name: 'balance',
            description: 'Reset all networths',
            type: 1, 
            options: null
        }
    ],
    async run(interaction, guild, author, args) {
        const guildID = guild.id
        let color = 'GREEN', title = author.user.username, icon_url = author.user.displayAvatarURL(), description = ''
        const econManagerRole = guild.roles.cache.find(role => {
            return role.name.toLowerCase() === 'economy manager'
        })

        if(!econManagerRole) {
            color = 'RED'
            description = 'Please create an \`Economy Manager\` role!'
        } else {
            if(!author.roles.cache.has(econManagerRole.id)) {
                color = 'RED',
                description = `You must have the <@&${econManagerRole.id}> role.`
            } else {
                if(args[0].name === 'inventory') {
                    const inventories = await inventorySchema.deleteMany({
                        guildID
                    })

                    description = `Deleted all inventories. \`${inventories.n}\` removed.`
                } else if(args[0].name === 'market') {
                    const removed = await marketItemSchema.deleteMany({
                        guildID
                    })

                    description = `Deleted all market listings. \`${removed.n}\` removed.`
                } else if(args[0].name === 'balance') {
                    const economies = await economySchema.deleteMany({
                        guildID
                    })
                    
                    description = `Deleted all economy profiles. \`${economies.n}\` removed.`
                }
            }
        }

        embed = util.embedify(color, title, icon_url, description)
        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
          ***REMOVED***
        }})
    }
}