const { Command } = require('discord.js-commando')

module.exports = class BanCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'ban',
               memberName: 'ban',
               argsSingleQuotes: true,
               argsType: 'multiple',
               argsCount: 3,
               args: [
                    {
                         key: 'user',
                         prompt: 'please @mention the member you wish to ban',
                         type: 'member'
                    }
               ]
          })
     }
}