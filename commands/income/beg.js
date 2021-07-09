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
               group: 'income',
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
          const properties = await util.getCommandStats(message.guild.id, 'beg', true, false)
          const uProperties = await util.getUserCommandStats(message.guild.id, message.author.id, 'beg', true, false)
          if (!util.isCooldown(message, properties, uProperties)) return // if cd is not up, end command
          if (!util.isSuccess(properties)) {
               message.channel.send({
                    embed: util.embedify(
                         'RED',
                         message.author.tag,
                         message.author.displayAvatarURL(),
                         `You begged but got nothing :slight_frown:`
                    )
               })
               return await util.setUserCommandStats(message.guild.id, message.author.id, 'beg', { timestamp: util.now() }, false) // if not successful, still reset the timestamp before ending the command
          }
          const { min, max } = properties
          const amount = util.intInRange(min, max)
          const cSymbol = await util.getCurrencySymbol(message.guild.id, false)
          message.channel.send({
               embed: util.embedify(
                    'GREEN',
                    message.author.tag,
                    message.author.displayAvatarURL(),
                    `You begged and earned ${cSymbol}${amount.toLocaleString()}!`
               )
          })
          await util.setUserCommandStats(message.guild.id, message.author.id, 'beg', { timestamp: util.now() }, false) // reset timestamp
          await util.changeBal(message.guild.id, message.author.id, amount) // +close mongo connection
     }
}