const economy = require('../../economy')
const { cSymbol } = require('../../config.json')

module.exports = {
     aliases: ['balance', 'bal', 'money'],
     maxArgs: 1,
     expectedArgs: '[@user]',
     exUse: '@Bob',
     description: 'Displays your balance',
     callback: async (message, arguments, text) => {
          const user = message.mentions.users.first() || message.author
          const { guild } = message 
          const guildID = guild.id
          const userID = user.id

          const balance = await economy.getBal(guildID, userID)

          message.channel.send({ embed: { 
               color: 'BLUE', 
               author: {
                    name: user.username,
                    icon_url: user.avatarURL()
             ***REMOVED*** 
               description: `:trophy: Guild Rank: 0`,
               fields: [
                    {
                         name: 'Balance',
                         value: `${cSymbol}${balance}`,
                         inline: true
                    }
               ]
          }})
   ***REMOVED***
}