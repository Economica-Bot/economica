const { prefix } = require('../../config.json')

module.exports = {
     commands: ['test'],
     expectedArgs: '<cmd>',
     minArgs: 1,
     _auth: 'BOT:OPERATOR',
     exUse: 'bal',
     description: 'test',
     callback: (message, arguments, text) => {
          let _message = ''
          arguments.forEach(argument => _message = `${_message}${argument} `)

          message.channel.send(`${prefix}${_message}`)
   ***REMOVED***
}