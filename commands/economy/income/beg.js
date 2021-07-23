const { Command } = require('discord.js-commando')
const util = require('../../../features/util')
const ms = require('ms')

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
               argsCount: 0
          })
     }

     async run(message) {
          const properties = await util.getCommandStats(message.guild.id, 'beg', true, false)
          const uProperties = await util.getUserCommandStats(message.guild.id, message.author.
          id, 'beg', true, false)
          if (!util.isCooldown(message, properties, uProperties)) {
               //If cooldown not exhausted
               return
          }
          
          if (!util.isSuccess(properties)) {
               message.channel.send({
                    embed: util.embedify(
                         'RED',
                         message.author.username,
                         message.author.displayAvatarURL(),
                         `You begged and received nothing. :slight_frown:`
                    )
               })
          } else {
               const { min, max } = properties
               const amount = util.intInRange(min, max)
               await util.setEconInfo(message.guild.id, message.author.id, amount, 0, amount, false) 
               const cSymbol = await util.getCurrencySymbol(message.guild.id, false)
               message.channel.send({
                    embed: util.embedify(
                         'GREEN',
                         message.author.username,
                         message.author.displayAvatarURL(),
                         `You begged and earned ${cSymbol}${amount.toLocaleString()}!`
                    )
               })
          }

          await util.setUserCommandStats(message.guild.id, message.author.id, 'beg', { timestamp: util.now() }) // reset timestamp
     }
}