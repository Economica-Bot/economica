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
        const cSymbol = await util.getCurrencySymbol(guild.id, false)
        await mongo().then(async (mongoose) => {
            const { wallet } = await util.getEconInfo(guild.id, author.id, false)
            if(parseInt(amount)) {
                amount = parseInt(amount)
                if (amount < 1 || amount > wallet) {
                    message.channel.send({ embed: util.embedify(
                        'RED',
                        message.author.username, 
                        message.author.displayAvatarURL(),
                        `Invalid amount! Current wallet: ${cSymbol}${wallet.toLocaleString()}`
                    ) })
                } else {
                    await util.setEconInfo(guild.id, author.id, -amount, amount, 0, false)
                    message.channel.send({ embed: util.embedify(
                        'GREEN',
                        message.author.username, 
                        message.author.displayAvatarURL(),
                        `Deposited ${cSymbol}${amount.toLocaleString()} to the treasury.`
                    )})
                }
            } else if(amount === 'all') {
                if (wallet < 1) {
                    message.reply(`Invalid amount! Current wallet" ${cSymbol}${wallet.toLocaleString()}`) 
                } else {
                    await util.setEconInfo(guild.id, author.id, -wallet, wallet, 0, false)
                    message.channel.send({ embed: util.embedify(
                        'GREEN',
                        message.author.username, 
                        message.author.displayAvatarURL(),
                        `Deposited ${cSymbol}${wallet.toLocaleString()} to the treasury.`
                    )})
                }
            } else {
                message.reply(`Invalid amount! Must be \`${this.name} ${this.format}\``)
            }
            
            mongoose.connection.close()
        })
    }
}