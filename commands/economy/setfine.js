const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const { income } = require('../../config.json')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setfine',
            aliases: [
                'set-fine',
                'fine-range',
                'set-fine-range'
            ],
            group: 'economy',
            memberName: 'setfine',
            guildOnly: true,
            description: 'Set the min and max fine for a fineable income command.',
            details: 'Set the minimum and maximum extremes of a fineable income command\'s fine range.',
            format: 'setfine <cmd> <minFine> <maxFine>',
            examples: [
                'setfine crime 100 500',
                'fine-range crime 200 1000'
            ],
            argsPromptLimit: 0,
            argsCount: 3,
            args: [
                {
                    key: 'cmd',
                    prompt: 'Please specify the desired income command.',
                    type: 'string'
              ***REMOVED*** {
                    key: 'minFine',
                    prompt: 'Please specify the minimum income loss.',
                    type: 'integer'
              ***REMOVED*** {
                    key: 'maxFine',
                    prompt: 'Please specify the maximum income loss.',
                    type: 'integer'
              ***REMOVED***
            ]
        })
    }

    async run(message, { cmd, minFine, maxFine }) {
        if (!income[cmd]) return util.errorEmbed(message, `\`${util.cut(cmd)}\` is not an income command.\n\nIncome commands: \`${(Object.getOwnPropertyNames(income)).join(`\`, \``)}\``, this.memberName)
        if (!income[cmd]?.minFine && !income[cmd]?.maxFine) {
            let fineableCmds = []
            for (const property in income) {
                if (income[property].minFine && income[property].maxFine) {
                    fineableCmds.push(property)
                }
            }
            return util.errorEmbed(message, `\`${util.cut(cmd)}\` is not a fineable income command.\n\nFineable income commands: \`${fineableCmds.join(`\`, \``)}\``, this.memberName)
        }
        const prefix = await util.getPrefix(message.guild.id)
        const currency = await util.getCurrencySymbol(message.guild.id)

        if (minFine < 0) {
            minFine = 0
        }
        if (maxFine < 0) {
            maxFine = 0
        }
        if (minFine > maxFine) {
            const tempmax = maxFine
            maxFine = minFine
            minFine = tempmax
        }


        util.infoEmbed(message, `Updated \`${prefix}${cmd}\`\n\nMinFine: ${currency}${minFine}\nMaxFine: ${currency}${maxFine}`, 'default', this.memberName)
        util.setCommandStats(message.guild.id, cmd, { minFine, maxFine })
    }
}