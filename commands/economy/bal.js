const economy = require('../../economy')
const { cSymbol } = require('../../config.json')
const fn = require('../../fn')

module.exports = {
     aliases: ['balance', 'bal', 'money'],
     maxArgs: 1,
     expectedArgs: '[@user | userID | name]',
     exUse: '@Economica#2412',
     description: 'Displays the requested user\'s balance or yours if left blank',
     callback: async (message, arguments, text) => {
          const { guild } = message

          let user = message.mentions.users.first() || fn.getMemberUserById(message, arguments[0], arguments[0]) || fn.getMemberUserIdByMatch(message, arguments[0], arguments[0]) || message.author
          if (user === 'endProcess') return
          if (
               Array.isArray(user) &&
               user.length == 1 
          ) {
               user = fn.getMemberUserById(message, user[0], user[0])
               console.log(user)
               fn.displayBal(message, guild, user, economy)

          } else if (
               Array.isArray(user)
          ) {
               let msg = ''; let i = 1
               user.forEach(id => msg = `${msg}\`${(i++).toString()}\` ${fn.getMemberUserById(message, id, id)}\n`)
               message.channel.send({
                    embed: {
                         color: 'BLUE',
                         author: {
                              name: message.author.tag,
                              icon_url: message.author.avatarURL(),
                         },
                         description: `Multiple members found. Please select one by typing its number.\n\n${msg}`,
                         footer: {
                              text: `Your search found ${(i-1).toString()} similar members in this guild.`
                         }
                    }
               })

               // custom number collector constructor function (see fn.js)
               const collector = fn.createNumberCollector(message, i, 20000)
               collector.on('collect', async m => {
                    user = fn.getMemberUserById(message, user[parseInt(m) - 1], user[parseInt(m) - 1])
               })
               collector.on('end', c => {
                    if (c.size == 0) {
                         return message.channel.send(`:hourglass_flowing_sand: time ran out ${message.author}`)
                    } else fn.displayBal(message, guild, user, economy)
               })
          } else {
               fn.displayBal(message, guild, user, economy)
          }
     },
}