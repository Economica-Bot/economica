const { Command } = require('discord.js-commando')
const mongo = require('../../features/mongo')
const util = require('../../features/util')
const inventorySchema = require('../../features/schemas/inventory-sch')

module.exports = class InventoryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'inventory',
            group: 'economy',
            memberName: 'inventory',
            guildOnly: true, 
            description: 'View your inventory.'
        })
    }

    async run(message) {
        const { author, guild } = message
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        let inventoryEmbed = util.embedify(
            'BLURPLE',
            author.tag, 
            author.displayAvatarURL(),
        ) 
        await mongo().then(async (mongoose) => {
            try {
                const inventory = await inventorySchema.findOne({
                    userID: author.id, 
                    guildID: guild.id
                }) 

                let i = 0
                if(inventory) {
                    for(const item of inventory.inventory) {
                        i++
                        inventoryEmbed.addField(
                            `${currencySymbol}${item.price} | \`${item.item}\``, 
                            `${item.description}`
                        )
                    }
                }

                inventoryEmbed.setDescription(`You own \`${i}\` items.`)
            } catch(err) {
                console.log(err)
            } finally {
                mongoose.connection.close()
            }
        })

        message.channel.send({ embed: inventoryEmbed })
    }
}