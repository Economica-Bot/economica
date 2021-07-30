const { Command } = require('discord.js-commando')
const mongo = require('../../../features/mongo')
const marketItemSchema = require('../../../features/schemas/market-item-sch')
const util = require('../../../features/util')
const { oneLine } = require('common-tags')
const inventorySchema = require('../../../features/schemas/inventory-sch')
const economySch = require('../../../features/schemas/economy-sch')

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
        let description

        const inventory = await inventorySchema.findOne({ 
            userID: author.id, 
            guildID: guild.id, 
        })

        const owned = inventory?.inventory.find(i => {
            return i.item === item
        })

        if(owned) {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL(),
                `You already have a \`${item}\`.`
            ) })

            return
        }
        
        const listing = await marketItemSchema.findOne({ guildID: guild.id, item, active: true })
        if(!listing) {
            message.channel.send(`\`${item}\` not found in market.`)
            return
        }

        const price = listing.price
        description = listing.description

        const econInfo = await util.getEconInfo(guild.id, author.id)
        if(econInfo.wallet < price) {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL(),
                `Insufficient funds!\nYour wallet: ${currencySymbol}${econInfo.wallet.toLocaleString()} | Price of \`${item}\`: ${currencySymbol}${price.toLocaleString()} `
            ) })

            return
        }

        message.channel.send({ embed: util.embedify(
            'GREEN',
            message.author.username, 
            message.author.displayAvatarURL(),
            `Successfully purchased \`${item}\` for ${currencySymbol}${price.toLocaleString()}`
            )
        })


        util.setEconInfo(guild.id, author.id, -price, 0, -price)
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
    }
}