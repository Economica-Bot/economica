
module.exports = {
  commands: ['add', 'plus'],
  expectedArgs: '<num1> <num2> [numx...]',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 20,
  exUse: '2 2',
  callback: (message, arguments, text) => {

    sum = +arguments[0], _message = `${arguments[0]}`
    for (i = 1; i < arguments.length; i++) {
      sum = sum + +arguments[i]
      _message = `${_message} + ${arguments[i]}`
    }

    message.channel.send(`\`\`\`m\n${_message}\n\n= ${sum}\`\`\``)
***REMOVED***
  permissions: [],
  requiredRoles: ['822668140960940044', '806716325773967361'],
  _auth: 'BOT:ADMIN'
}