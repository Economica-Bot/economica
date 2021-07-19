const { Command } = require('discord.js-commando')
const { oneLine } = require('common-tags')
const mongo = require('../../../features/mongo')
const inventorySch = require('../../../features/schemas/inventory-sch')
const marketItemSch = require('../../../features/schemas/market-item-sch')

module.exports = class PurgeEconomyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'market',
            memberName: 'purge',
            guildOnly: true, 
            description: 'Delete economy-related content on the server.',
            details:oneLine`Use at your own risk. There is no going back. 
                            Administrator only.`,
            format: '<inventory | market>',
            examples: [
                'purge inventory'
            ],
            userPermissions: [
                'ADMINISTRATOR'
            ],
            argsCount: 1, 
            args: [
                {
                    key: 'content',
                    prompt: 'Please name the content you wish to delete.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { content }) {
        const { author, guild } = message
        await mongo().then(async (mongoose) => {
            try {
                if(content === 'inventory') {
                    const inventories = await inventorySch.deleteMany({
                        guildID: guild.id
                    })
                    message.reply(`Deleted all inventories. \`${inventories.n}\` removed.`)
                } else if(content === 'market') {
                    let econManagerRole = guild.roles.cache.find(role => {
                        return role.name.toLowerCase() === 'economy manager'
                    })
        
                    if(!econManagerRole) {
                        message.reply('Please create an \`Economy Manager\` role!')
                        return
                    }
        
                    if(!message.member.roles.cache.has(econManagerRole.id)) {
                        message.channel.send({ embed: util.embedify(
                            'RED',
                            message.author.username, 
                            message.author.displayAvatarURL(),
                            `You must have the <@&${econManagerRole.id}> role.`
                        )} )
        
                        return
                    }
                    const removed = await marketItemSch.deleteMany({
                        guildID: guild.id
                    })
                    message.channel.send(`Removed ${removed.n} listings.`)
                } else {
                    message.channel.send('Invalid param. Must be \`inventory\` or \`market\`.')
                }
            } catch(err) {
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })
    }
} 