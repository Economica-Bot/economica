const { Command } = require('discord.js-commando')

const helper = require('../../features/helper')
const { prefix } = require('../../config.json')

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
            details: 'View this server\'s currency symbol or pass an emoji to replace the current symbol.',
            format: '[emoji | character(s)]',
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
                    key: 'emoji',
                    prompt: 'Please specify an emoji.',
                    type: 'string',
                    default: ''
                }
            ],
        })
    }

    async run(message, { emoji }) {

        // Outputs the current currency symbol
        if (!emoji) {
            const currency = await helper.getCurrencySymbol(message.guild.id)
            return helper.infoEmbed(
                message, 
                `The currency symbol is: ${currency}\n\nID: \`${currency}\``, 
                `use ${message.guild.commandPrefix}${this.format} to change symbol.`,
                this.memberName
            )
        }

        // Errors if the new symbol is the same
        if (emoji === await helper.getCurrencySymbol(message.guild.id)) {
            return helper.errorEmbed(
                message, 
                `\`${emoji}\` is already the server currency symbol.`, 
                this.memberName
            )
        }

        // Sets a new currency symbol
        else {
            const currency = await helper.setCurrencySymbol(message.guild.id, emoji)
            return helper.successEmbed(
                message, 
                `${message.guild}'s currency symbol set to ${currency}\n\nID: \`${currency}\``, 
                `Use ${message.guild.commandPrefix}${this.format} to change the symbol again.`
            )
        }
    }
}