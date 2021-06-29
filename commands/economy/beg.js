const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')
const ms = require('ms')

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
          const { guild, author } = message
          const currencySymbol = await helper.getCurrencySymbol(message.guild.id)

          const properties = await helper.getCommandStats(message.guild.id, 'beg')
          const uProperties = await helper.getUserCommandStats(guild.id, author.id, 'beg')

          const now = new Date
          const usedWhen = now.getTime()

          if ((usedWhen - uProperties.timestamp) < properties.cooldown) {
               return helper.errorEmbed(message, `:hourglass: You need to wait ${ms(properties.cooldown - (Date.now() - uProperties.timestamp))}`) // RIP the command if user is speedy
          }

          // reset the timestamp when used
          helper.setUserCommandStats(guild.id, author.id, 'beg', { timestamp: usedWhen })

          if ((Math.random() * 100) > properties.chance) {
               return helper.errorEmbed(message, 'You begged but nobody gave you anything')
          }

          const min = properties.min; const max = properties.max
          const amount = helper.intInRange(min, max)

          helper.changeBal(message.guild.id, message.author.id, amount)
          helper.successEmbed(message, `You begged and earned ${currencySymbol}${amount}!`)
     }
}