const { Command } = require('discord.js-commando')
const mongo = require('../../../features/mongo')
const marketItemSchema = require('../../../features/schemas/market-item-sch')
const util = require('../../../features/util')
const { oneLine } = require('common-tags')
const inventorySchema = require('../../../features/schemas/inventory-sch')

module.exports = class BuyItemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'buy',
            group: 'market',
            memberName: 'buy',
            guildOnly: true, 
            description: 'Purchase an item from the market.',
            details: oneLine`Upon purchase, a role with the name of the item will be added to your profile.
                            You can only buy 1x item. Case sEnSiTiVe. Refer to \`shop\` for item names. \`INDEV\``,
            format: '<item>',
            examples: [
                'buy house'
            ],
            argsCount: 1, 
            args: [
                {
                    key: 'item',
                    prompt: 'Please name an item you wish to buy.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { item }) {
        const { author, guild } = message
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        let price, description, exit = false
        await mongo().then(async (mongoose) => {
            try {    
                const inventory = await inventorySchema.findOne({ 
                    userID: author.id, 
                    guildID: guild.id, 
                })

                const owned = inventory?.inventory.find(i => {
                    return i.item === item
                })

                if(owned) {
                    message.channel.send(`You already have a \`${item}\`.`)
                    exit = true
                    mongoose.connection.close()
                    return
                }
                
                const listing = await marketItemSchema.findOne({ guildID: guild.id, item })
                if(!listing) {
                    message.channel.send(`\`${item}\` not found in market.`)
                    exit = true
                    mongoose.connection.close()
                    return
                }

                price = listing.price
                description = listing.description

                await inventorySchema.findOneAndUpdate({ 
                    userID: author.id, 
                    guildID: guild.id 
              ***REMOVED*** {
                    $push: {
                        inventory: {
                            item, 
                            price, 
                            description
                        }
                    }
              ***REMOVED*** {
                    upsert: true, 
                    new: true
                })
            } catch(err) {  
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })

        if(exit) {
            return
        }
        util.changeBal(guild.id, author.id, (-price) )
        message.channel.send({ embed: util.embedify(
            'GREEN',
            message.author.username, 
            message.author.displayAvatarURL(),
            `Successfully purchased \`${item}\` for ${currencySymbol}${price}`
            )
        })
    }
}