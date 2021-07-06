const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const { income } = require('../../config.json')
const ms = require('ms')

module.exports = class BalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'income',
            aliases: [
                'view-income',
                'list-income',
                'income-info',
            ],
            group: 'economy',
            memberName: 'income',
            guildOnly: true,
            description: 'View all income commands and their settings.',
            details: 'View the profit range, fine range, cooldown, fine chance, and more of all income commands in this guild.',
            format: '',
            examples: [
                'income'
            ],
            argsPromptLimit: 0,
            argsCount: 0
        })
    }

    async run(message) {
        let properties = {}
        let msg = []
        const cSymbol = util.getCurrencySymbol(message.guild.id)
        for (const command in income) {
            msg[command] = `__${command}__\n`
            properties[command] = await util.getCommandStats(message.guild.id, `${command}`)
            msg[command] = `${msg[command]}Min: ${cSymbol}${properties[command].min}\n`
            msg[command] = `${msg[command]}Max: ${cSymbol}${properties[command].max}\n`
            msg[command] = `${msg[command]}Cooldown: ${ms(properties[command].cooldown)}\n`
            if (properties[command].chance) msg[command] = `${msg[command]}Fail Chance: ${properties[command].chance}%\n`
            if (properties[command].minFine) msg[command] = `${msg[command]}minFine: ${cSymbol}${properties[command].minFine}\n`
            if (properties[command].maxFine) msg[command] = `${msg[command]}maxFine: ${cSymbol}${properties[command].maxFine}\n`
        }



        util.infoEmbed(message, `${msg.join(`\n`)}`, 'default', this.memberName)
    }
}