const { Command } = require('discord.js-commando')
const helper = require('../../helper')

module.exports = class BalCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'bal',
               aliases: ['balance', 'money', '$'],
               group: 'economy',
               guildOnly: true,
               memberName: 'bal',
               description: 'Shows a user\'s balance',
               details: 'Shows the specified user\'s balance or your balance if no user is specified.',
               examples: [
                    'bal [@user]',
                    'bal @Bob',
                    'bal bob'
               ],
               argsType: 'multiple',
               argsCount: 1,
               args: [
                    {
                         key: 'user',
                         type: 'string',
                         default: undefined
                    }
               ]
          })
     } 

     async run(message, {user}) {
          if (user === undefined) {
               user = message.author
          } else if (message.mentions.users.first()) {
               user = message.mentions.users.first()
          } else if (
               helper.getMemberUserById(message, user)
          ) {
               user = helper.getMemberUserById(message, user)
          } else if (
               helper.getMemberUserIdByMatch(message, user)
          ) {
               user = helper.getMemberUserById(message, helper.getMemberUserIdByMatch(message, user))
          } else {
               return message.channel.send({ embed: helper.createErrorEmbed(message.author, ('User not found! ' + this.examples), 'bal')})
          }

          if (user === 'endProcess') return;
     }
}