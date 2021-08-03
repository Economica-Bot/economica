const inventorySchema = require('../../util/mongo/schemas/inventory-sch')
const marketItemSchema = require('../../util/mongo/schemas/market-item-sch')

module.exports = {
    name: 'buy',
    group: 'market',
    description: 'Purchase an item from the market.',
    format: '<item>',
    global: true,
    options: [
        {
            name: 'item',
            description: 'Specify the item you wish to buy.',
            type: 3,
            required: true
        }
    ],
    async run(interaction, guild, author, args) {
        let color = 'BLURPLE', title = author.user.username, icon_url = author.user.displayAvatarURL(), description
        const currencySymbol = await util.getCurrencySymbol(guild.id), item = args[0].value
        const inventory = await inventorySchema.findOne({ 
            userID: author.id, 
            guildID: guild.id, 
        })

        const owned = inventory?.inventory.find(i => {
            return i.item === item
        })

        if(owned) {
            color = 'RED'
            description = `You already have a(n) \`${item}\`.`
        } else {
            const listing = await marketItemSchema.findOne({ guildID: guild.id, item, active: true })
            if(!listing) {
                color = 'RED'
                description = `\`${item}\` not found in market.`
            } else {
                const price = listing.price
                const desc = listing.description
                const { wallet } = await util.getEconInfo(guild.id, author.id)
                
                if(wallet < price) {
                    color = 'RED'
                    description = `Insufficient funds!\nYour wallet: ${currencySymbol}${wallet.toLocaleString()} | Price of \`${item}\`: ${currencySymbol}${price.toLocaleString()} `
                } else {
                    color = 'GREEN'
                    description = `Successfully purchased \`${item}\` for ${currencySymbol}${price.toLocaleString()}`
                    util.setEconInfo(guild.id, author.id, -price, 0, -price)
                    await inventorySchema.findOneAndUpdate({ 
                        userID: author.user.id, 
                        guildID: guild.id 
                  ***REMOVED*** {
                        $push: {
                            inventory: {
                                item, 
                                price, 
                                description: desc
                            }
                        }
                  ***REMOVED*** {
                        upsert: true, 
                        new: true
                    })
                }
            }
        }
        
        const embed = util.embedify(color, title, icon_url, description)
        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
          ***REMOVED***
        }})
    }
}