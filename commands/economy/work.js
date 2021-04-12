const economy = require('../../economy')
const { cSymbol } = require('../../config.json')

module.exports = {
     commands: ['work', 'w'],
     expectedArgs: 'none',
     exUse: 'work',
     description: 'test',
     callback: async (message, arguments, text) => {
          const randInt = (min = 0, max = 1) => {
               min = Math.ceil(min);
               max = Math.floor(max);
               return Math.floor(Math.random() * (max - min + 1) + min)
          }
          const user = message.author
          const amount = randInt(300, 700)
          const earned = `${cSymbol}${amount}`

          message.channel.send({
               embed: {
                    color: 'GREEN', title: `${earned}`,
                    description: `You worked and got ${earned}.`,
                    footer: {
                         text: user.name,
                         icon_url: user.avatarURL()
                    }
               }
          });

          const userID = user.id; const guildID = message.guild.id

          const balance = amount

          if (isNaN(balance)) 
               message.channel.send({ embed: { color: 'GRAY', title: 'ERROR', 
                    description: 'There was an error with this command'
               }}
          )
          const ubalance = await economy.addBal(guildID, userID, balance)
          console.log(`added ${amount} to ${user.name}'s balance`)
     }, // db.documentExistsOrNotDemo.find({"UserId":101}).count() > 0
}