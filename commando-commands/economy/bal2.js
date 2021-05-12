const { Command } = require('discord.js-commando')
const { getMemberUserById, getMemberUserIdByMatch, createNumberCollector, displayBal } = require('../../helper')

module.exports = class BalCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'bal2',
               aliases: ['balance', 'money', '$'],
               group: 'economy',
               guildOnly: true,
               memberName: 'bal2',
               description: 'Shows a user\'s balance',
               details: 'Shows the specified user\'s balance or your balance if no user is specified.',
               examples: [
                    'bal [@user]',
                    'bal @Bob',
                    'bal bob'
               ],
               argsType: 'multiple',
               args: [
                    {
                         key: 'user',
                         type: 'string',
                         default: undefined,
                         prompt: 'test'
                    }
               ]
          })
     } 

     async run(message, {user}) {
          // define the user appropriately based on author specificatons
          if (user === undefined) {
               user = message.author
          } else if (message.mentions.users.first()) {
               user = message.mentions.users.first()
          } else if (
               getMemberUserById(message, user)
          ) {
               user = getMemberUserById(message, user)
          } else if (
               getMemberUserIdByMatch(message, user)
          ) {
               user = getMemberUserById(message, getMemberUserIdByMatch(message, user))
          } else {
               return message.channel.send({ embed: createNumberCollector(message.author, ('User not found! ' + this.examples), 'bal')})
          }

          // return script exit code. getMemberUserIdByMatch handles sending error messages
          if (user === 'endProcess') return;

          console.log(user)

          let messageContent = ``
          if (user.length === 1) {
               messageContent = user.id
          } 
          else {
               // create and send the matched users list if matching users > 1
               let i = 1
               messageContent = `\`0\` - <@!${user.join(`>\n\`${i++}\`<@!`)}>`
               message.channel.send({ embed: {
                    author: {
                         name: message.author,
                         icon_url: message.author.iconURL()
                    },
                    description: `\`${user.length.toString()}\` user(s) found. Please type the key of the desired user below:\n\n${messageContent}`
               }})

               // listen for author's selection
               const collector = createNumberCollector(message, user.length, 30000)
               collector.on('collect', m => {
                    user = getMemberUserById(user[m])
               })
               collector.on('end', c => {
                    if (c === 0) return message.channel.send(':hourglass: Time ran out (30s).')
                    displayBal(message, message.guild, user)
               })
          }
     }
}