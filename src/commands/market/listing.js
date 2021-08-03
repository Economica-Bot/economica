const marketItemSchema = require('../../util/mongo/schemas/market-item-sch')
const inventorySchema = require('../../util/mongo/schemas/inventory-sch')

module.exports = {
    name: 'listing',
    group: 'market',
    description: 'Interact with the server market.',
    format: '<view | create | delete | enable | disable> [...args]',
    global: true, 
    options: [
        {
            name: 'view', 
            description: 'View listings.',
            type: 1, //SUB_COMMAND
            options: [ 
                {
                    name: 'user', 
                    description: 'Specify a user.', 
                    type: 6 //USER
                }
            ]
      ***REMOVED***
        {
            name: 'create', 
            description: 'Create a new listing.',
            type: 1,
            options: [ 
                {
                    name: 'item',
                    description: 'The listing name.',
                    type: 3, //STRING
                    required: true
              ***REMOVED***
                {
                    name: 'price',
                    description: 'This listing price.',
                    type: 4, //INTEGER
                    required: true
              ***REMOVED***
                {
                    name: 'description',
                    description: 'The listing description.',
                    type: 3
                }
            ]
      ***REMOVED***
        {
            name: 'delete', 
            description: 'Delete a market listing.',
            type: 1,
            options: [ 
                {
                    name: 'user',
                    description: 'Specify a user.',
                    type: 6,
                    required: true
              ***REMOVED***
                {
                    name: 'item',
                    description: 'The listing name.',
                    type: 3,
                    required: true
                }
            ]
      ***REMOVED***
        {
            name: 'enable', 
            description: 'Enable a market listing.',
            type: 1,
            options: [
                {
                    name: 'item', 
                    description: 'The listing item.',
                    type: 3, 
                    required: true
                }
            ]
      ***REMOVED***
        {
            name: 'disable',
            description: 'Disable a market listing.',
            type: 1, 
            options: [ 
                {
                    name: 'item', 
                    description: 'The listing item.', 
                    type: 3,
                    required: true
                }
            ]
        }
    ],
    async run(interaction, guild, author, args) {
        const guildID = guild.id
        let color = 'BLURPLE', title = author.user.username, icon_url = author.user.displayAvatarURL(), description = '', footer = '' 
        const embed = new Discord.MessageEmbed()
        const currencySymbol = await util.getCurrencySymbol(guildID)
        
        if(args[0].name === 'view') {
            const member = await guild.members.cache.get(args?.[0].options?.[0].value) 
                        ?? await guild.members.cache.get(author.user.id)

            const listings = await marketItemSchema.find({
                guildID, 
                userID: member.user.id
            })

            let i = 0, j = 0
            if(listings) {
                for(const listing of listings) {
                    i++
                    if(listing.active) j++
                    embed.addField(
                        `${currencySymbol}${listing.price.toLocaleString()} | \`${listing.item}\``, 
                        `${listing.description} | ${listing.active ? 'Listing **active**' : 'Listing **inactive**'}`
                    )
                }
            }

            description = `Total Listings: \`${i}\` | Active Listings: \`${j}\``
        } else if(args[0].name === 'create') {
            const item = args[0].options[0].value
            const price = args[0].options[1].value
            const desc = args[0].options[2]?.value ?? 'No description'

            const listing = await marketItemSchema.findOne({ guildID, userID: author.user.id, item, active: true })

            if(listing) {
                color = 'RED' 
                description = `You already have a(n) \`${item}\` for sale.`
                footer = 'Please use a different name.'
            } else {
                await new marketItemSchema({
                    userID: author.user.id, 
                    guildID,
                    item,
                    price,
                    description: desc,
                    active: true
                }).save()

                color = 'GREEN'
                description = `Successfully created a listing for \`${item}\``
                embed.addFields([
                    {
                        name: 'Price',
                        value: price.toLocaleString(),
                        inLine: true
                  ***REMOVED***
                    {
                        name: 'Description',
                        value: desc,
                        inLine: true
                    }
                ])
            }
        } else if(args[0].name === 'delete') {
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
                    const member = await guild.members.cache.get(args[0].options[0].value) 
                    const item = args[0].options[1].value
                    const listing = await marketItemSchema.findOneAndDelete({ guildID, userID: member.user.id, item })

                    if(!listing) {
                        color = 'RED'
                        description = `Could not find \`${item}\``
                    } else {
                        const items = await inventorySchema.updateMany(
                            { guildID, "inventory.item": item },
                            { $pull: { inventory: { item } } }
                        )
        
                        color = 'GREEN'
                        description = `Successfully deleted \`${item}\` from market DB.`
                        footer = item ? `${items.n} items removed.` : ''
                    }
                }
            }
        } else if(args[0].name === 'enable') {
            const item = args[0].options[0].value

            const listing = await marketItemSchema.findOneAndUpdate(
                { guildID, userID: author.user.id, item, active: false },
                { active: true }
            )

            if(!listing) {
                color = 'RED'
                description = `Could not find \`${item}\` as an inactive listing under your id.`,
                footer = 'Check your listings with `listing view`.'
            } else {
                color = 'GREEN'
                description = `Successfully enabled \`${item}\` on the market.`
            }
        } else if(args[0].name === 'disable') {
            const item = args[0].options[0].value

            const listing = await marketItemSchema.findOneAndUpdate(
                { guildID, userID: author.user.id, item, active: true },
                { active: false }
            )

            if(!listing) {
                color = 'RED'
                description = `Could not find \`${item}\` as an active listing under your id.`,
                footer = 'Check your listings with `listing view`.'
            } else{
                color = 'GREEN'
                description = `Successfully disabled \`${item}\` on the market.`
            }
        }
        
        
        embed
            .setColor(color)
            .setAuthor(title, icon_url)
            .setDescription(description)
            .setFooter(footer)
            .setTimestamp()

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
          ***REMOVED***
        }})

    }
}