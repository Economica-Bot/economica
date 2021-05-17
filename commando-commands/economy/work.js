const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')

module.exports = class WorkCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'work',
            aliases: [
                'w'
            ],
            group: 'economy',
            memberName: 'work',
            guildOnly: true,
            description: 'Earn cash money.',
            details: 'Work to increase your cash balance.',
            format: 'work',
            examples: [
                'work',
                'w'
            ],
            argsCount: 0
        })
    }

    async run(message) {
        const min = 100; const max = 1000;
        const amount = Math.floor((Math.random() * (max - min + 1)) + min)
        const currencySymbol = await helper.getCurrencySymbol(message.guild.id)
        helper.changeBal(message.guild.id, message.author.id, amount)
        helper.successEmbed(message, `${currencySymbol} ${amount}`)
    }
}