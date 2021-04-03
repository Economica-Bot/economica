const economy = require('../../economy')
const { cSymbol } = require('../../config.json')

module.exports = {
     commands: ['balance', 'bal', 'money'],
     maxArgs: 1,
     expectedArgs: '[@user]',
     exUse: 'bal\nbal @Bob',
     callback: async (message, arguments, text) => {
          const user = message.mentions.users.first() || message.author, userID = user.id
          const { guild } = message, guildID = guild.id

          const balance = await economy.getBal(guildID, userID)

          message.channel.send({ embed: { 
               color: 'BLUE', 
               author: {
                    name: user.username,
                    icon_url: user.avatarURL()
               }, 
               description: `:trophy: Guild Rank: 0`,
               fields: [
                    {
                         name: 'Balance',
                         value: `${cSymbol}${balance}`,
                         inline: true
                    }
               ]
          }})
     },
}