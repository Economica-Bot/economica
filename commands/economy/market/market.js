const { Command } = require('discord.js-commando')
const mongo = require('../../../features/mongo')
const marketItemSchema = require('../../../features/schemas/market-item-sch')
const util = require('../../../features/util')
const { oneLine } = require('common-tags')

module.exports = class MarketCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'market',
            aliases: [
                'listings'
            ],
            group: 'market',
            guildOnly: true, 
            memberName: 'market',
            description: 'Buy and sell items on the market.',
            details: oneLine`The market is a user powered, per-server bartering system. 
                            Stock, tax, fees, and experience are soon to be implemented.`
        })
    }

    async run(message) {
        const { guild } = message
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        await mongo().then(async (mongoose) => {
            try {
                const listings = await marketItemSchema.find({
                    guildID: message.guild.id,
                    active: true
                })
                .sort({
                    price: -1
                })

                let shopEmbed = util.embedify(
                    'BLURPLE',
                    guild.name, 
                    guild.iconURL()
                )
                
                let i = 0
                for(const listing of listings) {
                    i++
                    shopEmbed.addField(
                        `${currencySymbol}${listing.price}: \`${listing.item}\``,
                        `${listing.description}`
                    )
                }

                shopEmbed.setDescription(`There are \`${i}\` listings.`)

                message.channel.send({ embed: shopEmbed })
            } catch (err) {
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}