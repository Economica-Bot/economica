module.exports = {
     commands: ['eval', 'evaluate'],
     expectedArgs: '<statement>',
     minArgs: 0,
     maxArgs: Number.POSITIVE_INFINITY,
     exUse: `console.log('Hello World')`,
     callback: (message, arguments, text) => {
          const clean = text => {
               if (typeof (text) === "string") {
                    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
               } else return text;
          }

          const { channel } = message
          if (channel.id === '796906162548637780') {
               try {
                    let _message = eval(`${text}`)
                    if (typeof _message !== 'string') {
                         _message = require('util').inspect(_message)
                    }
                    message.channel.send({
                         embed: {
                              color: 'GREEN',
                              description: `Action:\n\`\`\`js\n${text}\n\`\`\`\nResult:\`\`\`js\n${clean(_message)}\n\`\`\``
                         }
                    }), { code: 'xl' }
               } catch (err) {
                    message.channel.send({
                         embed: {
                              color: 'RED',
                              title: 'ERROR',
                              description: `\`\`\`xl\n${clean(err)}\`\`\``,
                         }
                    })
               }
          } else {
               message.author.send('due to security risks with this command, it\'s usage is limited to <#796906162548637780>')
          }
   ***REMOVED***
     _auth: 'BOT:OPERATOR',
     silent: true
}