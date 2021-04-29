const { prefix } = require('../../config.json')

module.exports = {
     aliases: ['test'],
     expectedArgs: '<cmd>',
     minArgs: 1,
     maxArgs: 1, 
     permissions: ['ADMINISTRATOR'],
     _auth: 'BOT:OPERATOR',
     exUse: 'bal',
     description: 'test',
     callback: (message, arguments, text) => {
          let _message = ''
          arguments.forEach(argument => _message = `${_message}${argument} `)

          message.channel.send(`${prefix}${_message}`)
   ***REMOVED***
}