const { Command } = require('discord.js-commando')

const { oneLine } = require('common-tags')
const mongo = require('../../features/mongo')
const util = require('../../features/util')
const economySch = require('../../features/schemas/economy-sch')

module.exports = class DepositCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dep',
            aliases: [
                'deposit', 
                'd'
            ],
            group: 'economy',
            memberName: 'deposit',
            format: '<amount | all>',
            guildOnly: true,
            description: 'Deposit funds from your wallet to the treasury.',
            details: oneLine`Safely store your money by depositing it into the treasury. \`INDEV\``,
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
        let color = 'GREEN', description = ''
        const cSymbol = await util.getCurrencySymbol(guild.id, false)
        const { wallet } = await util.getEconInfo(guild.id, author.id, false)
        if(parseInt(amount)) {
            amount = parseInt(amount)
            if (amount < 1 || amount > wallet) {
                color = 'RED'
                description = `Invalid amount: \`${amount}\`\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`
            } else {
                description = `Deposited ${cSymbol}${amount.toLocaleString()}`
                await util.setEconInfo(guild.id, author.id, -amount, amount, 0, false)
            }
        } else if(amount === 'all') {
            if (wallet < 1) {
                color = 'RED'
                description = `Invalid amount! Current wallet: ${cSymbol}${wallet.toLocaleString()}`
            } else {
                description = `Deposited ${cSymbol}${wallet.toLocaleString()}`
                await util.setEconInfo(guild.id, author.id, -wallet, wallet, 0, false)
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