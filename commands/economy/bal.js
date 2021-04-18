const economy = require('../../economy')
const { cSymbol } = require('../../config.json')

module.exports = {
     commands: ['balance', 'bal', 'money'],
     maxArgs: 1,
     expectedArgs: '[@user]',
     exUse: 'bal\nbal @Bob',
     callback: async (message, arguments, text) => {
          const { guild } = message

          await guild.members.fetch()

          const getMemberUserById = () => {

               if (arguments[0]) {
                    const member = guild.members.cache.get(arguments[0])
                    if (
                         member != undefined
                    ) {
                         return member.user
                    }
               }
          }

          const getMemberUserByMatch = () => {

               if (arguments[0]) {

                    const member = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(arguments[0].toLowerCase()) || m.displayName.toLowerCase().includes(arguments[0].toLowerCase()))
                    // const membersIndexById = member.filter(m => m.user.username)
                    console.log(member.user)

                    if (
                         member != undefined
                    ) {
                         return member.user
                    }
               }
          } 

          console.log(await getMemberUserById())
          console.log(`-------------------------\n\n\n-------------------------`)
          //console.log(await getMemberUserByMatch())


          const user = message.mentions.users.first() || getMemberUserById() || /* getMemberUserByMatch()  || */message.author

          const guildID = guild.id
          const userID = user.id

          const balance = await economy.getBal(guildID, userID)

          message.channel.send({
               embed: {
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
               }
          })
     },
}