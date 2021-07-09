const { Command } = require('discord.js-commando')
const util = require('../../features/util')
let Appendix = require('../../features/objects')
const { income } = require('../../config.json')
const ms = require('ms')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setcooldown',
            aliases: [
                'setcd',
                'set-cooldown',
                'set-cd',
                'cooldown-time',
                'set-cooldown-time',
                'set-throttle'
            ],
            group: 'economy',
            memberName: 'setcooldown',
            guildOnly: true,
            description: 'Set the time a user must wait between **income** command usages.',
            details: 'Set the minimum required time interval between usages of an income command.',
            format: '<cmd> <duration>',
            examples: [
                'setcooldown  work 30m',
                'set-cd beg 1d',
                'cooldown-time crime 60000'
            ],
            argsPromptLimit: 0,
            argsCount: 2,
            args: [
                {
                    key: 'cmd',
                    prompt: 'Please specify the desired income command.',
                    type: 'string'
              ***REMOVED*** {
                    key: 'cooldown',
                    prompt: 'Please specify the minimum income gain.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { cmd, cooldown }) {
        if (!income[cmd]) return util.errorEmbed(message, `\`${util.cut(cmd)}\` is not a valid income command.\n\nIncome commands: \`${(Object.getOwnPropertyNames(income)).join(`\`, \``)}\``, this.memberName)
        const prefix = await util.getPrefix(message.guild.id)
        const currency = await util.getCurrencySymbol(message.guild.id)

        if (!typeof +cooldown != 'number') {
            cooldown = ms(cooldown)
        } else cooldown = +cooldown

        if (cooldown < 30000) {
            cooldown = 30000
        }
        if (cooldown > 604800000) {
            cooldown = 604800000
        } // one week


        util.infoEmbed(message, `Updated \`${prefix}${cmd}\`\n\nCooldown: ${currency}${ms(cooldown)}`, 'default', this.memberName)
        util.setCommandStats(message.guild.id, cmd, { cooldown })
    }
}