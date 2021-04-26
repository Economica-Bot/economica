module.exports = {
     aliases: ['quiz'],
     expectedArgs: 'none',
     exUse: 'quiz',
     _auth: 'BOT:TESTER',
     callback: (message, arguments, text) => {
          message.channel.send({ embed: {
               title: 'Sample Quiz',
               author: {
                    name: message.author.tag,
                    icon_url: message.author.avatarURL()
               },
               description: 'Type your response to the question below:\n\nWhat is \`2 + 2\`?',
               footer: {
                    text: '⏳60s'
               }
          }})

          const filter = m => {
               return (
                    (m.content == '4' || m.content == 'four') &&
                    m.author.id === message.author.id
               )
          }
          const collector = message.channel.createMessageCollector(filter, { max: 1, time: 60000 })
          
          collector.on('collect', m => {
               m.channel.send(message.channel.send(`<@${m.author.id}> answered correctly with \`${m.content}\``))
          })

          collector.on('end', c => {
               message.channel.send('Time ran out!')
          })
     },
}