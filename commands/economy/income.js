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
        const cSymbol = await util.getCurrencySymbol(message.guild.id)

        let incomeEmbed = util.embedify(
            'BLURPLE',
            `${message.guild.name}'s Income Commands`,
            message.guild.iconURL()
        )
        for (const command in income) {
            let description = ''; let properties = {}
            properties[command] = await util.getCommandStats(message.guild.id, `${command}`)
            description += `Min: ${cSymbol}${properties[command].min}\n`
            description += `Max: ${cSymbol}${properties[command].max}\n`
            description += `Cooldown: ${ms(properties[command].cooldown)}\n`
            if (properties[command].chance) description += `Fail Chance: ${properties[command].chance}%\n`
            if (properties[command].minFine) description += `minFine: ${cSymbol}${properties[command].minFine}\n`
            if (properties[command].maxFine) description += `maxFine: ${cSymbol}${properties[command].maxFine}\n`
            incomeEmbed.addField(
                `__${command}__`,
                description
            )
        }

        message.channel.send({ embed: incomeEmbed })
    }
}