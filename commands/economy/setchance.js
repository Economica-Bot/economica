const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')
const { income } = require('../../config.json')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setchance',
            aliases: [
                'set-chance',
                'set-fail-chance',
                'fail-rate',
                'set-fail-rate'
            ],
            group: 'economy',
            memberName: 'setchance',
            guildOnly: true,
            description: 'Set the probability of failure for a chanceable income command.',
            details: 'Set the % chance that a command will be unsuccessful and the user will not make money.',
            format: '<cmd> <chance>',
            examples: [
                'setchance 50',
                'set-fail-rate 75%'
            ],
            argsPromptLimit: 0,
            argsCount: 2,
            args: [
                {
                    key: 'cmd',
                    prompt: 'Please specify the desired income command.',
                    type: 'string'
              ***REMOVED*** {
                    key: 'chance',
                    prompt: 'Please specify the fail chance',
                    type: 'integer'
              ***REMOVED***
            ]
        })
    }

    async run(message, { cmd, chance }) {
        if (!income[cmd]) return helper.errorEmbed(message, `\`${helper.cut(cmd)}\` is not an income command.\n\nIncome commands: \`${(Object.getOwnPropertyNames(income)).join(`\`, \``)}\``, this.memberName)
        if (!income[cmd]?.chance) {
            let chanceableCmds = []
            for (const property in income) {
                if (income[property].chance) {
                    chanceableCmds.push(property)
                }
            }
            return helper.errorEmbed(message, `\`${helper.cut(cmd)}\` is not a chanceable income command.\n\nChanceable income commands: \`${chanceableCmds.join(`\`, \``)}\``, this.memberName)
        }
        const prefix = await helper.getPrefix(message.guild.id)

        if (!typeof +chance !== 'number') {
            if (chance.endsWith('%')) {
                chance = +(chance.substr(0, chance.indexOf('%')))
            } else {
                helper.errorEmbed(message, '<chance> must be a number.', this.memberName)
            }
        }

        if (+chance < 0) {
            chance = 0
        }
        if (+chance > 100) {
            chance = 100
        }

        console.log(chance)

        helper.infoEmbed(message, `Updated \`${prefix}${cmd}\`\n\nFail Chance: ${chance}%`, 'default', this.memberName)
        helper.setCommandStats(message.guild.id, cmd, { chance })
    }
}