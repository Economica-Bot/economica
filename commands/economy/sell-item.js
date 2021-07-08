const { Command } = require('discord.js-commando')
const mongo = require('../../features/mongo')
const marketItemSchema = require('../../features/schemas/market-item-sch')
const util = require('../../features/util')
const { oneLine } = require('common-tags')

module.exports = class SellItemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sell',
            group: 'economy',
            memberName: 'sell',
            guildOnly: true, 
            description: 'Sell an item for cash.',
            details: oneLine`The item you wish to sell must be in your inventory. 
                            The item resale value depends on your level. \`INDEV\``,
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
        const member = await guild.members.fetch(author)
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        let price, roleID, found = true
        await mongo().then(async (mongoose) => {
            try { 
                const listing = await marketItemSchema.findOne({ guildID: guild.id, item })
                if(!listing) {
                    found = false
                }
                price = listing?.price
                roleID = listing?.roleID
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
        const itemRole = await guild.roles.cache.find(role => role.id === roleID)
        if(!itemRole) {
            message.channel.send(`Could not find role ${item}`)
            return
        }
        if(member.roles.cache.has(roleID)) {
            member.roles.remove(itemRole, `Sold ${item} `)
        } else {
            message.channel.send(`You don't have a ${item}!`)
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