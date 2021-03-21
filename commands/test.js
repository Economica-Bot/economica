const { prefix } = require('../config.json')

module.exports = {
     commands: 'test',
     expectedArgs: '<cmd>',
     minArgs: 1,
     _auth: 'BOT:ADMIN',
     exUse: 'add 2 2',
     callback: (message, arguments, text) => {
          let _message = ''
          arguments.forEach(argument => _message = `${_message}${argument} `)

          message.channel.send(`${prefix}${_message}`)
     },
}