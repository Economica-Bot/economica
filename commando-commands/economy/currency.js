const { Command } = require('discord.js-commando')
const { getCurrencySymbol, displayEmbedInfo, updateCurrencySymbol } = require('../../helper')
const { prefix } = require('../../config.json')
const BalanceCommand = require('./bal')

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
               format: 'currency [:emoji:]',
               examples: [
                    'currency :dollar:',
                    'currency'
               ],
               args: [
                    {
                         key: 'emoji',
                         prompt: 'Please specify an emoji.',
                         type: 'string',
                         default: 'get'
                    }
               ]
          })
     }

     async run(message, {emoji}) {
          if (emoji === 'get') {
               const currency = await getCurrencySymbol(message.guild.id)
               message.channel.send({ embed: displayEmbedInfo(message.author, `The currency symbol for this server is: ${currency}\n\nID:\`${currency}\``, `use ${prefix}${this.format} to change symbol.`)})
          } else {
               const currency = await setCurrencySymbol(message.guild.id, emoji)
               if (currency) return message.channel.send({ embed: displayEmbedInfo(message.author, `The currency symbol for this server has been set to ${currency}\n\nID: \`${currency}\``, `use ${prefix}${this.format} to change symbol again.`)})
          } 
     }
}