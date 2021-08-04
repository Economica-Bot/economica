require('module-alias/register')

const inventorySchema = require('@schemas/inventory-sch')

module.exports = {
    name: 'sell',
    group: 'market',
    description: 'Sell an item for wallet cash.',
    format: '<item>',
    global: true,
    options: [
        {
            name: 'item',
            description: 'Specify the item you wish to sell.',
            type: 3,
            required: true
        }
    ],
    async run(interaction, guild, author, options) {
        let color = 'BLURPLE', title = author.user.username, icon_url = author.user.displayAvatarURL(), description
        const currencySymbol = await util.getCurrencySymbol(guild.id), item = options._hoistedOptions[0].value
        const inventory = await inventorySchema.findOne({ 
            userID: author.id, 
            guildID: guild.id, 
        })

        const owned = inventory?.inventory.find(i => {
            return i.item === item
        })

        if(!owned) {
            color = 'RED'
            description = `You do not have a(n) \`${item}\`.`
        } else {
            const price = owned.price
            color = 'GREEN', description = `Successfully sold \`${item}\` for ${currencySymbol}${price.toLocaleString()}`
            await util.setEconInfo(guild.id, author.id, price, 0, price)
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