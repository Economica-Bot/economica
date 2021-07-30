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
          const { guild, author } = message
          const properties = await util.getCommandStats(guild.id, this.name)
          const uProperties = await util.getUserCommandStats(guild.id, author.
          id, 'beg')
          if (!util.coolDown(message, properties, uProperties)) {
               return
          }
          
          let color, description
          if (!util.isSuccess(properties)) {
                    color = 'RED'
                    description = 'You begged and received nothing. :slight_frown:'
          } else {
               const { min, max } = properties
               const amount = util.intInRange(min, max)
               await util.setEconInfo(guild.id, author.id, amount, 0, amount) 
               const cSymbol = await util.getCurrencySymbol(message.guild.id)
               color = 'GREEN'
               description = `You begged and earned ${cSymbol}${amount.toLocaleString()}!`
          }

          message.channel.send({ embed: util.embedify(
               color, 
               author.username, 
               author.displayAvatarURL(),
               description
          ) })

          await util.setUserCommandStats(guild.id, author.id, this.name, { timestamp: new Date().getTime() }) 
     }
}