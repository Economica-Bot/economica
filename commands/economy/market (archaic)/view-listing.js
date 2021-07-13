const { Command } = require('discord.js-commando')
const mongo = require('../../../features/mongo')
const marketItemSch = require('../../../features/schemas/market-item-sch')
const util = require('../../../features/util')

module.exports = class ViewListingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'viewlisting',
            aliases: [
                'viewlistings'
            ],
            group: 'market (archaic)',
            memberName: 'viewlisting',
            guildOnly: true, 
            description: 'View own listings.',
            details: '\`INDEV\`',
        })
    }

    async run(message) {
        message.channel.send('archived. use `listing`')
        return
        const { guild, author } = message
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        let listingsEmbed = util.embedify(
            'BLURPLE',
            author.tag, 
            author.displayAvatarURL()
        )
        await mongo().then(async (mongoose) => {
            try {    
                const listings = await marketItemSch.find({
                    guildID: guild.id,
                    userID: author.id
                })

                let i = 0, j = 0
                if(listings) {
                    for(const listing of listings) {
                        i++
                        if(listing.active) j++
                        listingsEmbed.addField(
                            `${currencySymbol}${listing.price} | \`${listing.item}\``,
                            `${listing.description} | ${listing.active ? 'Listing **active**' : 'Listing **inactive**'}` 
                        )
                    }
                }

                listingsEmbed.setDescription(`You've made \`${i}\` listings, \`${j}\` of which are active.`)
            } catch(err) {
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })

        message.channel.send({ embed: listingsEmbed })
    }
}