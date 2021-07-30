const { Command } = require('discord.js-commando')
const util = require('../../../features/util')
const { income } = require('../../../config.json')
const ms = require('ms')

module.exports = class IncomeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'income',
            aliases: [
                'view-income',
                'list-income',
                'income-info',
            ],
            group: 'income',
            memberName: 'income',
            guildOnly: true,
            description: 'View all income commands and their settings.',
            details: 'View the profit range, fine range, cooldown, fine chance, and more of all income commands in this guild.',
        })
    }

    async run(message) {
        let incomeEmbed = util.embedify(
            'BLURPLE',
            `${message.guild.name}'s Income Commands`,
            message.guild.iconURL(),
            'Use `setincome <cmd>` to configure income commands.'
        )

        for (const command in income) {
            let properties = await util.getCommandStats(message.guild.id, command)
            let description = '```'
            for(const property in properties) {
                description += `${property}: ${properties[property]}\n`
            }

            incomeEmbed.addField(
                `__${command}__`,
                `${description}\`\`\``, 
                true
            )
        }

        message.channel.send({ embed: incomeEmbed })
    }
}