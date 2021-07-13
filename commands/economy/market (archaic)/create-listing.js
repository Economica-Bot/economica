const { Command } = require('discord.js-commando')
const mongo = require('../../../features/mongo')
const marketItemSchema = require('../../../features/schemas/market-item-sch')
const util = require('../../../features/util')

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
            group: 'market (archaic)',
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
                    key: 'price',
                    prompt: 'Please provide a price.',
                    type: 'float'
              ***REMOVED*** 
                {
                    key: 'description',
                    prompt: 'Please provide a description.',
                    type: 'string',
                    default: 'No description'
                }
            ]
        })
    }

    async run(message, { item, price, description }) {
        message.channel.send('archived. use `listing`')
        return
        const { guild, author } = message
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