const { prefix } = require('../../config.json')

module.exports = {
     aliases: ['test'],
     expectedArgs: '<cmd>',
     minArgs: 1,
     maxArgs: 10, 
     permissions: ['ADMINISTRATOR'],
     _auth: 'BOT:OPERATOR',
     exUse: 'bal',
     description: 'test',
     callback: (message, arguments, text) => {
          let _message = ''
          if(arguments[0] === 'omitprefix') {
               arguments.forEach(argument => _message = `${_message}${argument} `)
               _message = _message.substr(_message.indexOf(" ") + 1);
               message.channel.send(`${_message}`)
          }
          arguments.forEach(argument => _message = `${_message}${argument} `)

          message.channel.send(`${prefix}${_message}`)
   ***REMOVED***
}