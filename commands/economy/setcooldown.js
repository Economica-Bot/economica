const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')
let Appendix = require('../../features/objects')
const { income } = require('../../config.json')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setpay',
            aliases: [
                'set-pay',
                'pay-range',
                'set-pay-range'
            ],
            group: 'economy',
            memberName: 'setpay',
            guildOnly: true,
            description: 'Set the min and max profit for an income command.',
            details: 'Set the minimum and maximum extremes of an income command\'s profit range.',
            format: 'setpay <cmd> <min> <max>',
            examples: [
                'setpay work 100 500',
                'set-income crime 200 1000'
            ],
            argsPromptLimit: 0,
            argsCount: 3,
            args: [
                {
                    key: 'cmd',
                    prompt: 'Please specify the desired income command.',
                    type: 'string'
              ***REMOVED*** {
                    key: 'cooldown',
                    prompt: 'Please specify the minimum income gain.',
                    type: 'integer'
              ***REMOVED*** {
                    key: 'max',
                    prompt: 'Please specify the maximum income gain.',
                    type: 'integer'
              ***REMOVED***
            ]
        })
    }

    async run(message, { cmd, cooldown }) {
        if (!income[cmd]) return helper.errorEmbed(message, `\`${helper.cut(cmd)}\` is not a valid income command.\n\nIncome commands: \`${(Object.getOwnPropertyNames(income)).join(`\`, \``)}\``)
        const prefix = await helper.getPrefix(message.guild.id)
        const currency = await helper.getCurrencySymbol(message.guild.id)

        if (cooldown < 30000) {
            cooldown = 30000
        }


        helper.infoEmbed(message, `Updated \`${prefix}${cmd}\`\n\nMin: ${currency}${cooldown}\nMax: ${currency}${max}`, 'default', this.memberName)
        helper.setCommandStats(message.guild.id, cmd, { cooldown })
    }
}