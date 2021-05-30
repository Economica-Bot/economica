const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')

module.exports = class BegCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'beg',
               aliases: [
                    'pls'
               ],
               group: 'economy',
               memberName: 'beg',
               guildOnly: true,
               description: 'Possibly earn cash money',
               details: 'Beg to possibly increase your cash balance',
               format: 'beg',
               examples: [
                    'beg'
               ],
               argsCount: 0
          })
     }

     async run(message) {
          const properties = await helper.getIncomeStats(message.guild.id, 'beg')
          const currencySymbol = await helper.getCurrencySymbol(message.guild.id)

          const min = properties.min; const max = properties.max
          const amount = helper.intInRange(min, max)

          helper.changeBal(message.guild.id, message.author.id, amount)
          helper.successEmbed(message, `You worked and earned ${currencySymbol}${amount}!`)
     }
}