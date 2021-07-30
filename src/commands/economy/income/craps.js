const { Command } = require('discord.js-commando')

const util = require('../../../features/util')
const { oneLine } = require('common-tags')

module.exports = class CrapsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'craps',
            group: 'income',
            memberName: 'craps',
            guildOnly: true, 
            description: 'INDEV',
            details: oneLine`INDEV`,
            format: 'INDEV',
            args: [
                {
                    key: 'user',
                    prompt: 'Please @mention, name, or provide the id of a user.',
                    type: 'string',
                    default: '',
                }
            ]
        })
    }

    async run(message, { user }) {
        const { author, guild } = message
        let id = await util.getUserID(message, user)
        if(id === 'noMemberFound') {
            return
        }

        user = guild.members.cache.get(author.id).user
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet, treasury, networth, rank } = await util.getEconInfo(guild.id, id)
    }
}