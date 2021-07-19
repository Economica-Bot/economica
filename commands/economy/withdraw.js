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
        await mongo().then(async (mongoose) => {
            const { treasury } = await util.getEconInfo(guild.id, author.id, false)
            if(parseInt(amount)) {
                amount = parseInt(amount)
                if (amount < 1 || amount > treasury) {
                    message.channel.send({ embed: util.embedify(
                        'RED',
                        message.author.username, 
                        message.author.displayAvatarURL(),
                        `Invalid amount! Current treasury: ${cSymbol}${treasury.toLocaleString()}`
                    ) })
                } else {
                    await util.setEconInfo(guild.id, author.id, amount, -amount, 0, false)
                    message.channel.send({ embed: util.embedify(
                        'GREEN',
                        message.author.username, 
                        message.author.displayAvatarURL(),
                        `Retrieved ${cSymbol}${amount} from the treasury.`
                    )})
                }
            } else if(amount === 'all') {
                if (treasury < 1) {
                    message.reply(`Invalid amount! Current treasury: ${cSymbol}${treasury.toLocaleString()}`)
                } else {
                    await util.setEconInfo(guild.id, author.id, treasury, -treasury, 0, false)
                    message.channel.send({ embed: util.embedify(
                        'GREEN',
                        message.author.username, 
                        message.author.displayAvatarURL(),
                        `Retrieved ${cSymbol}${treasury.toLocaleString()} from the treasury.`
                    )})
                }
            } else {
                message.reply(`Invalid amount! Must be \`${this.name} ${this.format}\``)
            }

            mongoose.connection.close()
        })
    }
}