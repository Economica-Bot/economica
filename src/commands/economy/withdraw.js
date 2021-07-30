const { Command } = require('discord.js-commando')

const { oneLine } = require('common-tags')
const mongo = require('../../features/mongo')
const util = require('../../features/util')
const economySch = require('../../features/schemas/economy-sch')

module.exports = class DepositCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'with',
            aliases: [
                'withdraw', 
                'w'
            ],
            group: 'economy',
            memberName: 'withdraw',
            guildOnly: true,
            description: 'Withdraw funds from the treasury to your wallet.',
            details: oneLine`\`INDEV\``,
            args: [
                {
                    key: 'amount',
                    prompt: 'Please name the amount you wish to deposit.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { amount }) {
        const { guild, author } = message
        const cSymbol = await util.getCurrencySymbol(guild.id, false)
        const { treasury } = await util.getEconInfo(guild.id, author.id, false)
        let description = '', color = 'GREEN' 
        if(parseInt(amount)) {
            amount = parseInt(amount)
            if (amount < 1 || amount > treasury) {
                color = 'RED'
                description = `Invalid amount: \`${amount}\`\nCurrent treasury: ${cSymbol}${treasury.toLocaleString()}`
            } else {
                description = `Retrieved ${cSymbol}${amount.toLocaleString()}`
                await util.setEconInfo(guild.id, author.id, amount, -amount, 0, false)
            }
        } else if(amount === 'all') {
            if (treasury < 1) {
                color = 'RED',
                description = `Invalid amount! Current treasury: ${cSymbol}${treasury.toLocaleString()}`
            } else {
                description = `Retrieved ${cSymbol}${treasury.toLocaleString()}`
                await util.setEconInfo(guild.id, author.id, treasury, -treasury, 0, false)
            }
        } else {
            color = 'RED'
            description = `Invalid amount: \`${amount}\`\nFormat: \`${this.format}\``
        }

        message.channel.send({ embed: util.embedify(
            color, 
            message.author.username, 
            message.author.displayAvatarURL(),
            description
        ) })
    }
}