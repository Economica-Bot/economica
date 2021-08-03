const inventorySchema = require('../../util/mongo/schemas/inventory-sch')

module.exports = {
    name: 'inventory',
    group: 'market',
    description: 'View an inventory.',
    format: '[user]',
    global: true, 
    options: [
        {
            name: 'user',
            description: 'Name a user you wish to see the inventory of.',
            type: 6 
        }
    ],
    async run(interaction, guild, author, args) {
        const member = await guild.members.cache.get(args?.[0].value)
                    ?? await guild.members.cache.get(author.user.id)

        const currencySymbol = await util.getCurrencySymbol(guild.id)
        const inventory = await inventorySchema.findOne({
            userID: member.user.id, 
            guildID: guild.id
        })

        let inventoryEmbed = util.embedify(
            'BLURPLE',
            member.user.username, 
            member.user.displayAvatarURL(),
        ) 

        let i = 0
        if(inventory) {
            for(const item of inventory.inventory) {
                i++
                inventoryEmbed.addField(
                    `${currencySymbol}${item.price.toLocaleString()} | \`${item.item}\``, 
                    `${item.description}`
                )
            }
        }

        inventoryEmbed.setDescription(`\`${i}\` Items`)

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
            embeds: [ inventoryEmbed ],
          ***REMOVED***
        }})
    }
}