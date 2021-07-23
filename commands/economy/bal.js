const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const { oneLine } = require('common-tags')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bal',
            aliases: [
                'balance',
                'b',
            ],
            group: 'economy',
            memberName: 'balance',
            guildOnly: true,
            description: 'View balance.',
            details: oneLine`View your balance or someone else's balance by specifying the user. 
                            This can be done with @mention, id, or simply typing part of their name.`,
            format: '[@mention | id | name]',
            examples: [
                'bal @QiNG-agar#0540',
                'bal qing',
            ],
            args: [
                {
                    key: 'user',
                    prompt: 'Please @mention, name, or provide the id of a user.',
                    type: 'string',
                    default: '',
              ***REMOVED***
            ],
        })
    }

    async run(message, { user }) {
        const { author, guild } = message
        let id
        if(user) {
            id = await util.getUserID(message, user)    
            if (id === 'noMemberFound') {
                return 
            }
        } else {
            id = author.id
        }

        user = guild.members.cache.get(id).user
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet, treasury, networth, rank } = await util.getEconInfo(guild.id, id)
        const balEmbed =  util.embedify(
            'GOLD',
            user.username, 
            user.avatarURL(),
            '',
            `🏆 Rank ${rank}`
            ).addFields([
                {
                    name: 'Wallet',
                    value: `${cSymbol}${wallet.toLocaleString()}`,
                    inline: true
              ***REMOVED***
                {
                    name: 'Treasury',
                    value: `${cSymbol}${treasury.toLocaleString()}`,
                    inline: true
              ***REMOVED***
                {
                    name: 'Net Worth',
                    value: `${cSymbol}${networth.toLocaleString()}`,
                    inline: true
                }
            ])
        
        message.channel.send({ embed: balEmbed })
    }
}
