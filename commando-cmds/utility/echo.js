const Commando = require('discord.js-commando');

module.exports = class FirstCommand extends Commando.Command {
     constructor(client) {
          super(client, {
               name: 'echo',
               group: 'utility',
               memberName: 'echo',
               description: 'Echo arguments',
               argType: 'single'
          })
     }

     async run(message, args) {
          console.log(args)
          console.log(args.length)
          const user = message.author
          const last = args.length - 1

          if (args[last] == '--embed' || args[last] == '--e') {
               const text = args[0, last - 1]
               message.channel.send({ embed: { 
                    author: {
                         name: user.tag,
                         icon_url: user.avatarURL(),
                    },
                    description: text
               }})
          } else message.channel.send(args)
     }
}