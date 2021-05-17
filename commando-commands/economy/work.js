const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')

module.exports = class BalanceCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'work',
               aliases: [
                    'w'
               ],
               group: 'economy',
               memberName: 'work',
               guildOnly: true,
               description: 'Earn cash money.',
               details: 'Work to increase your cash balance.',
               format: 'work',
               examples: [
                    'work',
                    'w'
               ],
               argsCount: 0
          })
     }

     async run(message) {
          const income = await helper.getIncome(message.guild.id, 'work')
          const min = income[0]; const max = income[1]
          console.log(min, max)
          const amount = Math.floor((Math.random() * (max - min + 1)) + min)

          const currencySymbol = await helper.getCurrencySymbol(message.guild.id)

          const embed = helper.createSuccessEmbed(message.author, `${currencySymbol} ${amount}`)
          message.channel.send({ embed })

          helper.addBal(message.guild.id, message.author.id, amount)
     }
}