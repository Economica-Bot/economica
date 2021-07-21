const { Command } = require('discord.js-commando')
const mongo = require('../../../features/mongo')
const util = require('../../../features/util')
const inventorySchema = require('../../../features/schemas/inventory-sch')
const { oneLine } = require('common-tags')

module.exports = class InventoryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'inventory',
            aliases: [
                'inv'
            ],
            group: 'market',
            memberName: 'inventory',
            guildOnly: true, 
            description: 'View inventory.',
            details: oneLine`View your inventory or someone else's inventory by specifying the user. 
                            This can be done with @mention, id, or simply typing part of their name.`,
            format: '[@mention | id | name]',
            examples: [
                'inventory @Adrastopoulos#2753',
                'inventory adrast'
            ],
            args: [
                {
                    key: 'user',
                    prompt: 'Please @mention, name, or provide the id of a user.',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    async run(message, { user }) {
        const { author, guild } = message
        let id
        if(user) {
            id = await util.getUserID(message, user)
            if(id === 'noMemberFound') {
                return
            }
        } else {
            id = author.id
        }

        user = guild.members.cache.get(id).user
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        let inventoryEmbed = util.embedify(
            'BLURPLE',
            user.tag, 
            user.displayAvatarURL(),
        ) 
        await mongo().then(async (mongoose) => {
            try {
                const inventory = await inventorySchema.findOne({
                    userID: user.id, 
                    guildID: guild.id
                }) 

                let i = 0
                if(inventory) {
                    for(const item of inventory.inventory) {
                        i++
                        inventoryEmbed.addField(
                            `${currencySymbol}${item.price} | \`${item.item}\``, 
                            `${item.description}`
                        )
                    }
                }

                inventoryEmbed.setDescription(`\`${i}\` Items`)
            } catch(err) {
                console.log(err)
            } finally {
                mongoose.connection.close()
            }
        })

        message.channel.send({ embed: inventoryEmbed })
    }
}