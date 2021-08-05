const economySchema = require('@schemas/economy-sch')
const marketItemSchema = require('@schemas/market-item-sch')
const inventorySchema = require('@schemas/inventory-sch')

module.exports = {
    name: 'purge',
    group: 'economy',
    description: 'Delete economy-related content on the server',
    format: '<inventory | market | balance> [user]',
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
            description: 'Delete inventory data.',
            type: 2, //SUB_COMMAND_GROUP
            options: [
                {
                    name: 'all', 
                    description: 'All inventories.',
                    type: 1, //SUB_COMMAND
                    options: null
              ***REMOVED***
                {
                    name: 'user', 
                    description: 'Specify a user.',
                    type: 1,
                    options: [
                        {
                            name: 'user', 
                            description: 'Specify a user.',
                            type: 6,
                            required: true
                        }
                    ]
                }
            ]
      ***REMOVED***
        {
            name: 'market',
            description: 'Delete market data.',
            type: 2, //SUB_COMMAND_GROUP
            options: [
                {
                    name: 'all', 
                    description: 'All listings.',
                    type: 1, //SUB_COMMAND
                    options: null
              ***REMOVED***
                {
                    name: 'user', 
                    description: 'Specify a user.',
                    type: 1,
                    options: [
                        {
                            name: 'user', 
                            description: 'Specify a user.',
                            type: 6,
                            required: true
                        }
                    ]
                }
            ]
      ***REMOVED***
        {
            name: 'balance',
            description: 'Delete balance data.',
            type: 2, //SUB_COMMAND_GROUP
            options: [
                {
                    name: 'all', 
                    description: 'All balances.',
                    type: 1, //SUB_COMMAND
                    options: null
              ***REMOVED***
                {
                    name: 'user', 
                    description: 'Specify a user.',
                    type: 1,
                    options: [
                        {
                            name: 'user', 
                            description: 'Specify a user.',
                            type: 6,
                            required: true
                        }
                    ]
                }
            ]
        }
    ],
    async run(interaction, guild, author, options) {
        const guildID = guild.id
        let color = 'GREEN', title = author.user.username, icon_url = author.user.displayAvatarURL(), description = ''

        if(options._group === 'inventory') {
            if(options._subcommand === 'all') {
                await inventorySchema.deleteMany({
                    guildID
                }).then(result => {
                    description = `Deleted all inventory data. \`${result.n}\` removed.`
                })
            } else if(options._subcommand === 'user') {
                const user = options._hoistedOptions[0].user
                await inventorySchema.findOneAndDelete({
                    guildID, 
                    userID: user.id
                }).then(result => {
                    description = `Deleted ${user.username}'s inventory data. \`${result.inventory.length}\` items removed.`
                })
            }
        } else if(options._group === 'market') {
            if(options._subcommand === 'all') {
                await marketItemSchema.deleteMany({
                    guildID
                }).then(result => {
                    description = `Deleted all market data. \`${result.n}\` removed.`
                })
            } else if(options._subcommand === 'user') {
                const user = options._hoistedOptions[0].user
                await marketItemSchema.deleteMany({
                    guildID, 
                    userID: user.id
                }).then(result => {
                    description = `Deleted market data for <@!${user.id}>`
                })
            }
        } else if(options._group === 'balance') {
            if(options._subcommand === 'all') {
                await economySchema.deleteMany({
                    guildID
                }).then(result => {
                    description = `Deleted all balance data. \`${result.n}\` removed.`
                })
            } else if(options._subcommand === 'user') {
                const user = options._hoistedOptions[0].user
                await economySchema.deleteMany({
                    guildID, 
                    userID: user.id
                }).then(result => {
                    description = `Deleted balance data for <@!${user.id}>`
                })
            }
        }

        embed = util.embedify(color, title, icon_url, description)
        await interaction.reply({ embeds: [ embed ] })
    }
}