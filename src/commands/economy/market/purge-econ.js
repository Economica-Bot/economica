const { Command } = require('discord.js-commando')

const util = require('../../../features/util')
const inventorySch = require('../../../features/schemas/inventory-sch')
const marketItemSch = require('../../../features/schemas/market-item-sch')

const { oneLine } = require('common-tags')
const economySch = require('../../../features/schemas/economy-sch')


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
            format: '<inventory | market | balance>',
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
        const { guild } = message
        const econManagerRole = guild.roles.cache.find(role => {
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

        if(content === 'inventory') {
            const inventories = await inventorySch.deleteMany({
                guildID: guild.id
            })
            message.channel.send({ embed: util.embedify(
                'GREEN',
                guild.name, 
                guild.iconURL(),
                `Deleted all inventories. \`${inventories.n}\` removed.`
            ) })
        } else if(content === 'market') {
            const removed = await marketItemSch.deleteMany({
                guildID: guild.id
            })
            message.channel.send({ embed: util.embedify(
                'GREEN',
                guild.name, 
                guild.iconURL(),
                `Deleted all market listings. \`${removed.n}\` removed.`
            ) })
        } else if(content === 'balance') {
            const economies = await economySch.deleteMany({
                guildID: guild.id
            })
            message.channel.send({ embed: util.embedify(
                'GREEN',
                guild.name, 
                guild.iconURL(),
                `Deleted all economy profiles. \`${economies.n}\` removed.`
            ) })
        } else {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL()
                `Invalid param: \`${content}\`\nUsage: \`${this.format}\`.`
            ) })
        }
    }
} 