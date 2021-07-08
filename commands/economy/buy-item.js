const { Command } = require('discord.js-commando')
const mongo = require('../../features/mongo')
const marketItemSchema = require('../../features/schemas/market-item-sch')
const util = require('../../features/util')
const { oneLine } = require('common-tags')

module.exports = class BuyItemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'buy',
            group: 'economy',
            memberName: 'buy',
            guildOnly: true, 
            description: 'Purchase an item from the market.',
            details: oneLine`Upon purchase, a role with the name of the item will be added to your profile.
                            You can only buy 1x item. Case sEnSiTiVe. Refer to \`shop\` for item names.`,
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
        const member = await guild.members.fetch(author)
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        let price, roleID, found = true
        await mongo().then(async (mongoose) => {
            try {
                const listing = await marketItemSchema.findOne({ guildID: guild.id, item })
                if(!listing) {
                    found = false
                    return
                }
                price = listing.price
                roleID = listing.roleID
            } catch(err) {  
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })
        if(!found) {
            message.channel.send(`Could not find \`${item}\` in db.`)
            return
        }
        const itemRole = await guild.roles.cache.find(role => role?.id === roleID)
        if(!itemRole) {
            message.channel.send(`Could not find role for ${role}`)
            return
        }
        if(!member.roles.cache.has(roleID)) {
            member.roles.add(itemRole, `Purchased ${item}`)
        } else {
            message.channel.send(`You already have a \`${item}\``)
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