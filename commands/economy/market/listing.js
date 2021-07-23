const { Command } = require('discord.js-commando')

const util = require('../../../features/util')
const marketItemSchema = require('../../../features/schemas/market-item-sch')
const inventorySch = require('../../../features/schemas/inventory-sch')

const { oneLine } = require('common-tags')

module.exports = class ListingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'listing',
            group: 'market',
            memberName: 'listing',
            guildOnly: true,
            description: 'Interact with the server market.',
            details: oneLine`Listings may be viewed, created, deleted, enabled, and disabled.
                            You must have created the listing in order to enable/disable them.
                            Disabling a listing will remove the listing from the market - 
                            It may be re-enabled at any time. 
                            Users who purchased items will retain them if the listing is disabled, 
                            but will lose them if the listing is deleted.
                            Only economy managers may delete listings.`,
            format: '<view | create | delete | enable | disable> [..args]',
            args: [
                {
                    key: 'param',
                    prompt: 'Please provide a valid listing argument.',
                    type: 'string',
                    default: ''
                
              ***REMOVED***
                {
                    key: 'args', 
                    prompt: 'Please provide valid arguments for the aforementioned listing argument.',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    async run(message, { param, args }) {
        const { guild, author } = message
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        if(param === 'view') {
            let id
            if(args) {
                id = await util.getUserID(message, args)    
                if (id === 'noMemberFound') {
                    return 
                }
            } else {
                id = author.id
            }

            const user = guild.members.cache.get(id).user
            let listingsEmbed = util.embedify(
                'BLURPLE',
                user.tag, 
                user.displayAvatarURL()
            )
            
            const listings = await marketItemSchema.find({
                guildID: guild.id,
                userID: id
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

            listingsEmbed.setDescription(`You have \`${i}\` listings, \`${j}\` of which are active.`)
            message.channel.send({ embed: listingsEmbed })
            return
        } else if(param === 'create') {
            let item, price, description
            args = args.split(' ')
            item = args[0]
            if(parseInt(args[1])) {
                price = parseInt(args[1])
                
                if(price < 1) {
                    message.channel.send({ embed: util.embedify(
                        'RED',
                        message.author.username, 
                        message.author.displayAvatarURL(),
                        `Invalid price: ${currencySymbol}${price}.`
                    ) })

                    return
                }
                description = args[2] ? args.slice(2).join(' ') : 'No description'
            } else {
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    args[1] ? `\`${args[1]}\` must be a number!` : 'Please provide a price!'
                ) })

                return
            }

            const listing = await marketItemSchema.findOne({
                guildID: guild.id, 
                item
            })

            if(listing) {
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `\`${item}\` is already registered!`,
                    'Please use a different name.'
                ) })

                return
            }

            await new marketItemSchema({
                userID: author.id, 
                guildID: guild.id, 
                item, 
                price,
                description, 
                active: true
            }).save()
    
            message.channel.send({ embed: util.embedify(
                'GREEN',
                author.username, 
                author.displayAvatarURL(),
                `Successfully created a listing for \`${item}\``
                ).addFields([
                    {
                        name: 'Price',
                        value: `${price}`,
                        inLine: true
                  ***REMOVED*** 
                    {
                        name: 'Description',
                        value: `${description}`,
                        inLine: true
                    }
                ]) 
            })

            return
        } else if (param === 'delete') {
            let item = args
            const listing = await marketItemSchema.findOneAndDelete({
                guildID: guild.id, 
                item
            })

            if(!listing) {
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `Could not find \`${item}\`.`
                ) })

                return
            }

            const items = await inventorySch.updateMany({
                guildID: guild.id, 
                "inventory.item": item
          ***REMOVED*** {
                $pull: {
                    inventory: {
                        item
                    }
                }
            })         

            message.channel.send({ embed: util.embedify(
                'GREEN',
                message.author.username, 
                message.author.displayAvatarURL(),
                `Successfully deleted \`${item}\` from market DB.`,
                items ? `${items.n} items removed.` : ''
            ) })
            
            return
        } else if (param === 'enable') {
            let item = args
            if(!item) {
                message.reply('Please name the listing you wish to enable.')
                return
            }

            const listing = await marketItemSchema.findOneAndUpdate({ 
                guildID: guild.id, 
                userID: author.id, 
                item, 
                active: false 
          ***REMOVED*** {
                active: true
            })
            
            if (!listing) {
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `Could not find \`${item}\` as an inactive listing under your id.`,
                    'Check your listings with *viewlistings*. Case Senstive'
                ) })

                return
            }

            message.channel.send({ embed: util.embedify(
                'GREEN',
                message.author.username, 
                message.author.displayAvatarURL(),
                `Successfully enabled \`${item}\` on the market.`
            ) })    

            return
        } else if (param === 'disable') {
            let item = args
            if(!item) {
                message.reply('Please name the listing you wish to disable.')
                return
            }

            const listing = await marketItemSchema.findOneAndUpdate({ 
                guildID: guild.id, 
                userID: author.id, 
                item, 
                active: true 
          ***REMOVED*** {
                active: false
            })
            
            if (!listing) {
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `Could not find \`${item}\` as an active listing under your id.`,
                    'Check your listings with *viewlistings*. Case Senstive'
                ) })
                
                return
            }

            message.channel.send({ embed: util.embedify(
                'GREEN',
                message.author.username, 
                message.author.displayAvatarURL(),
                `Successfully disabled \`${item}\` on the market.`
            ) })    

            return
        } else {
            if (!param) {
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `You need to provide an argument!\n\nYou may be searching for \`listings\` or \`listing view\``,
                    `Format: \`${this.format}\``
                )} )
                return
            }
            
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL(),
                `Invalid argument: \`${param}\`\nFormat: \`${this.format}\``,
            )} )
        }
    }
}