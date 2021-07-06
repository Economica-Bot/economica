const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const { oneLine } = require('common-tags')

module.exports = class CurrencyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'currency',
            aliases: [
                'symbol',
                'setcurrency',
                'setsymbol'
            ],
            group: 'economy',
            memberName: 'currency',
            guildOnly: true,
            description: 'Returns or updates the guild currency symbol',
            details: oneLine`
            If no symbol is entered, The current currency symbol will be shown.
            If the symbol is "default", the currency will be set to the default currency.`,
            format: 'currency [symbol]',
            examples: [
                'currency :dollar:',
                'currency'
            ],
            clientPermissions: [
                'USE_EXTERNAL_EMOJIS'
            ],
            userPermissions: [
                'ADMINISTRATOR'
            ],
            args: [
                {
                    key: 'currency',
                    prompt: 'Please specify a currency symbol.',
                    type: 'string',
                    default: ''
                }
            ],
        })
    }

    async run(message, { currency }) {
        let color, description, footer
        const currCurrencySymbol = await util.getCurrencySymbol(message.guild.id)

        //outputs the current currency symbol
        if (!currency) {
            color = 'BLURPLE'
            description = `The currency symbol is: ${currCurrencySymbol}`
            footer = `use ${message.guild.commandPrefix}${this.format} to change currency symbol`
        }

        // Errors if the new symbol is the same
        else if (currency === currCurrencySymbol) {
            color = 'RED'
            description = `${currency} is already the server currency symbol.`
        }

        // Sets a new currency symbol
        else {
            color = 'GREEN'
            description = `Currency symbol set to ${await util.setCurrencySymbol(message.guild.id, currency)}`
            footer = currency
        }

        message.channel.send({ embed: util.embedify(
            color,
            message.guild.name, 
            message.guild.iconURL(),
            description, 
            footer
            )
        })
    }
}