const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const mongo = require('../../features/mongo')
const marketItemSchema = require('../../features/schemas/market-item-sch')
const { oneLine } = require('common-tags')

module.exports = class RemoveListingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removelisting',
            aliases: [
                'marketremove',
                'listingremove',
                'removelist',
                'listremove'
            ],
            group: 'economy',
            memberName: 'removelisting',
            guildOnly: true,
            description: 'Remove a server market listing.',
            details: oneLine`You must have created the listing in order to remove it. 
                            Users who purchased your item will retain it.`,
            format: '<item>',
            args: [
                {
                    key: 'item',
                    prompt: 'Please name the item you wish to remove from the shop.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { item }) {
        const { guild, author } = message
        let exit = false
        await mongo().then(async (mongoose) => {
            try {
                const listing = await marketItemSchema.findOneAndUpdate({ 
                    guildID: guild.id, 
                    userID: author.id, 
                    item, 
                    active: true 
              ***REMOVED*** {
                    active: false
                })
                
                if (!listing) {
                    message.channel.send(`Could not find ${item} as an active listing under your id.`)
                    exit = true
                    mongoose.connection.close()
                    return
                }
            } catch(err) {  
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })

        if(exit) {
            return
        } 

        message.channel.send({ embed: util.embedify(
            'GREEN',
            message.author.tag, 
            message.author.displayAvatarURL(),
            `Successfully removed \`${item}\` from shop.`
        ) })
    }
}