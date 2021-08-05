

const economySchema = require('@schemas/economy-sch')
const marketItemSchema = require('@schemas/market-item-sch')
const inventorySchema = require('@schemas/inventory-sch')

module.exports = {
    name: 'purge',
    group: 'market',
    description: 'Delete economy-related content on the server',
    format: '<inventory | market | balance>',
    global: true, 
    permissions: [
        'ADMINISTRATOR'
    ],
    roles: [
        'ECONOMY MANAGER'
    ],
    options: [
        {
            name: 'inventory',
            description: 'Delete ALL inventories unless a user is specifed.',
            type: 1, //SUB_COMMAND
            options: [
                {
                    name: 'user', 
                    description: 'Specify a user.',
                    type: 6
                }
            ]
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
            options: [
                {
                    name: 'user', 
                    description: 'Specify a user.',
                    type: 6
                }
            ]
        }
    ],
    async run(interaction, guild, author, options) {
        const guildID = guild.id
        let color = 'GREEN', title = author.user.username, icon_url = author.user.displayAvatarURL(), description = ''
        
        if(options._subcommand === 'inventory') {
            if(options._hoistedOptions.length) {
                const user = options._hoistedOptions[0].user
                const inventory = await inventorySchema.findOneAndDelete({
                    guildID, 
                    userID: user.id
                })

                description = `Deleted ${user.username}'s inventory. \`${inventory.inventory.length}\` items removed.`
            } else {
                const inventories = await inventorySchema.deleteMany({
                    guildID
                })

                description = `Deleted all inventories. \`${inventories.n}\` removed.`
            }
        } else if(options._subcommand === 'market') {
            const removed = await marketItemSchema.deleteMany({
                guildID
            })

            description = `Deleted all market listings. \`${removed.n}\` removed.`
        } else if(options._subcommand === 'balance') {
            if(options._hoistedOptions.length) {
                const user = options._hoistedOptions[0].user
                await economySchema.findOneAndDelete({
                    guildID, 
                    userID: user.id
                })

                description = `Deleted ${user.username}'s balance.`
            } else {
                const economies = await economySchema.deleteMany({
                    guildID
                })
                
                description = `Deleted all economy profiles. \`${economies.n}\` removed.`
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