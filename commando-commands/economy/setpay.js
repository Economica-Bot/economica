const { Command } = require('discord.js-commando')
const helper = require('../../features/helper')
let Appendix = require('../../features/objects')
const incomeSchema = require('../../features/schemas/income-sch')

module.exports = class BalanceCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'setpay',
               aliases: [
                    'setincome',
                    'set-income',
                    'income-set',
                    'set-pay',
               ],
               group: 'economy',
               memberName: 'setpay',
               guildOnly: true,
               description: 'Set the min and max profit for an income command.',
               details: 'Set the minimum and maximum extremes of an income command\'s profit range.',
               format: 'setpay <cmd> <min> <max>',
               examples: [
                    'setpay work 100 500',
                    'set-income crime 200 1000'
               ],
               argsPromptLimit: 0,
               argsCount: 3,
               args: [
                    {
                         key: 'cmd',
                         prompt: 'Please specify the desired income command.',
                         type: 'string'
                  ***REMOVED*** {
                         key: 'min',
                         prompt: 'Please specify the minimum income gain.',
                         type: 'integer'
                  ***REMOVED*** {
                         key: 'max',
                         prompt: 'Please specify the maximum income gain.',
                         type: 'integer'
                  ***REMOVED***
               ]
          })
     }

     async run(message, {cmd, min, max}) {
          // if (!incomeSchema[cmd]) return helper.errorEmbed(message, `\`${cmd}\` is not a valid income command`, 'work')
          const prefix = await helper.getPrefix(message.guild.id)
          const currency = await helper.getCurrencySymbol(message.guild.id)
          
          let appendix = new Appendix()
          console.log(appendix.content)

          if (min < 0) {
               min = 0
               //appendix.addError('Min value was less than 0')
          }
          if (max < 0) {
               max = 0 
               //appendix.addError('Max value was less than 0')
          }
          if (min > max) {
               const tempmax = max
               max = min
               min = tempmax
               //appendix.addError('Min value was greater than Max value')
          }

          //console.log(appendix.content)

          helper.infoEmbed(message, `Updated \`${prefix}${cmd}\`\n\nMin: ${currency}${min}\nMax: ${currency}${max}`, 'default', 'setpay')

          helper.setIncome(message.guild.id, cmd, min, max)
     }
}