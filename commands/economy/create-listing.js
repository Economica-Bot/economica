const { Command } = require('discord.js-commando')
const mongo = require('../../features/mongo')
const marketItemSchema = require('../../features/schemas/market-item-sch')
const util = require('../../features/util')

module.exports = class CreateListingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'createlisting',
            aliases: [
                'marketcreate',
                'listingcreate',
                'createlist',
                'listcreate'
            ],
            group: 'economy',
            memberName: 'createlisting',
            guildOnly: true,
            description: 'Create a server market listing.',
            details: '\`INDEV\`',
            format: '<item> <price> <description>',
            examples: [
                'createlisting house 1000 A lovely place to call home'
            ],
            argsType: 'multiple',
            args: [
                {
                    key: 'item',
                    prompt: 'Please name an item you wish to sell.',
                    type: 'string'
              ***REMOVED***
                {
                    key: 'args',
                    prompt: 'Please provide a price and a description.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { item, args }) {
        const { guild, author } = message
        let args1 = args.split(' ')
        let price, description
        if(parseInt(args1[0])) {
            price = parseInt(args1[0])
            description = args.substring(args.indexOf(' ') + 1)
        } else {
            message.channel.send({ embed: util.embedify(
                'RED',
                author.username, 
                author.displayAvatarURL(),
                `${args1[0]} is not an amount!`
            ) })
        }

        await mongo().then(async (mongoose) => {
            try {
                await new marketItemSchema({
                    userID: author.id, 
                    guildID: guild.id, 
                    item, 
                    price,
                    description, 
                    active: true
                }).save()
            } catch(err) {
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })

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
    }
}