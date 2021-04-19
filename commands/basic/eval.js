module.exports = {
     commands: ['eval', 'evaluate'],
     expectedArgs: '<statement>',
     minArgs: 0,
     maxArgs: Number.POSITIVE_INFINITY,
     permission: 'ADMINISTRATOR',
     exUse: `console.log('Hello World')`,
     description: 'Executes JavaScript from a string',
     callback: (message, arguments, text) => {
          const clean = text => {
               if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
               else return text;
          }

          const { channel } = message
          if (channel.id === '796906162548637780') {
               try {
                    let _message = eval(`${text}`)
                    if (typeof _message !== 'string') _message = require('util').inspect(_message);
                    if (_message.length + text.length < 2015) {
                         message.channel.send({
                              embed: {
                                   color: 'GREEN',
                                   description: `Action:\n\`\`\`js\n${text}\n\`\`\`\nResult:\`\`\`js\n${clean(_message)}\n\`\`\``
                              }
                         }), { code: 'xl' }
                    } else {
                         message.channel.send({
                              embed: {
                                   color: 'RED',
                                   title: 'ERROR',
                                   description: `\`\`\`xl\nDiscordAPIError: Invalid Form Body embed.description: Must be 2048 or fewer in length.\n\`\`\`\nThe evaluated message is too long!`
                              }
                         })
                    }
               } catch (err) {
                    message.channel.send({
                         embed: {
                              color: 'RED',
                              title: 'ERROR',
                              description: `\`\`\`xl\n${clean(err)}\`\`\``,
                         }
                    })
               }
          } else message.author.send('Due to security risks with `.eval`, its usage is limited to <#796906162548637780>');
   ***REMOVED***
     _auth: 'BOT:OPERATOR',
     silent: true
}