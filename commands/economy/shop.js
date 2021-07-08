const { Command } = require('discord.js-commando')
const mongo = require('../../features/mongo')
const marketItemSchema = require('../../features/schemas/market-item-sch')
const util = require('../../features/util')

module.exports = class ShopCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'shop',
            aliases: [
                'market'
            ],
            group: 'economy',
            guildOnly: true, 
            memberName: 'shop',
            description: 'Buy and sell items on the shop.',
            details: '\`INDEV\`'
        })
    }

    async run(message) {
        const { guild } = message
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        await mongo().then(async (mongoose) => {
            try {
                const listings = await marketItemSchema.find({
                    guildID: message.guild.id
                })
                .sort({
                    price: -1
                })

                let shopEmbed = util.embedify(
                    'BLURPLE',
                    guild.name, 
                    guild.iconURL()
                )

                for(const listing of listings) {
                    shopEmbed.addField(
                        `${currencySymbol}${listing.price}: \`${listing.item}\``,
                        `${listing.description}`
                    )
                }

                message.channel.send({ embed: shopEmbed })
            } catch (err) {
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}