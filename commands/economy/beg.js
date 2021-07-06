const { Command } = require('discord.js-commando')
const util = require('../../features/util')
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
               format: '',
               examples: [
                    'beg'
               ],
               argsCount: 0
          })
     }

     async run(message) {
          const { guild, author } = message
          const currencySymbol = await util.getCurrencySymbol(message.guild.id)

          const properties = await util.getCommandStats(message.guild.id, 'beg')
          const uProperties = await util.getUserCommandStats(guild.id, author.id, 'beg')

          const now = new Date
          const usedWhen = now.getTime()

          if ((usedWhen - uProperties.timestamp) < properties.cooldown) {
               return util.errorEmbed(message, `:hourglass: You need to wait ${ms(properties.cooldown - (Date.now() - uProperties.timestamp))}`, this.memberName) // RIP the command if user is speedy
          }

          // reset the timestamp when used
          util.setUserCommandStats(guild.id, author.id, 'beg', { timestamp: usedWhen })

          if ((Math.random() * 100) < properties.chance) {
               return util.errorEmbed(message, 'You begged but nobody gave you anything', this.memberName)
          }

          const min = properties.min; const max = properties.max
          const amount = util.intInRange(min, max)

          util.changeBal(message.guild.id, message.author.id, amount)
          util.successEmbed(message, `You begged and earned ${currencySymbol}${amount}!`)
     }
}