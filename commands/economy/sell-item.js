const { Command } = require('discord.js-commando')
const { oneLine } = require('common-tags')

const mongo = require('../../features/mongo')
const util = require('../../features/util')
const inventorySchema = require('../../features/schemas/inventory-sch')

module.exports = class SellItemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sell',
            group: 'economy',
            memberName: 'sell',
            guildOnly: true, 
            description: 'Sell an item for cash.',
            details: oneLine`The item you wish to sell must be in your inventory. 
                            The item resale value depends on your level. 
                            Case sEnSiTiVe. \`INDEV\``,
            format: '<item>',
            examples: [
                'sell house'
            ],
            argsCount: 1, 
            args: [
                {
                    key: 'item',
                    prompt: 'Please name an item you wish to sell.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { item }) {
        const { author, guild } = message
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        let price, exit = false
        await mongo().then(async (mongoose) => {
            try { 
                const inventory = await inventorySchema.findOne({
                    userID: author.id, 
                    guildID: guild.id,
                })

                const owned = inventory?.inventory.find(i => {
                    return i.item === item
                })

                if(!owned) {
                    message.channel.send(`You do not own a \`${item}\`.`)
                    exit = true
                    mongoose.connection.close()
                    return
                }

                price = owned.price

                await inventorySchema.findOneAndUpdate({
                    userID: author.id, 
                    guildID: guild.id
              ***REMOVED*** {
                    $pull: {
                        inventory: {
                            item
                        }
                    }
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

        util.changeBal(guild.id, author.id, price)
        message.channel.send({ embed:
            util.embedify(
                'GREEN',
                message.author.username, 
                message.author.displayAvatarURL(),
                `Successfully sold \`${item}\` for ${currencySymbol}${price}`
            )
        })
    }
}