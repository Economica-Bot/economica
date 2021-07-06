const { Command } = require('discord.js-commando')
const util = require('../../features/util')

module.exports = class BegCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'beg',
               aliases: [
                    'pls'
               ],
               group: 'income',
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
          const properties = await util.getPayout(message.guild.id, 'beg')
          const currencySymbol = await util.getCurrencySymbol(message.guild.id)
          const min = properties.min; const max = properties.max
          const amount = helper.intInRange(min, max)
          util.changeBal(message.guild.id, message.author.id, amount)
          message.channel.send({ embed: util.embedify(
               'GREEN',
               message.author.tag,
               message.author.displayAvatarURL(),
               `You begged and earned ${currencySymbol}${amount}!`
               )
          })
     }
}