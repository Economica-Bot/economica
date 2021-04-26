const fn = require('../../fn')

module.exports = {
     commands: ['fn', 'fntest'],
     expectedArgs: '[?args]',
     minArgs: 0,
     maxArgs: Number.POSITIVE_INFINITY,
     exUse: 'fn ?arg0 ?arg1 ?arg2',
     _auth: 'BOT:OPERATOR',
     silent: true,
     callback: (message, arguments, text) => {
          // ...
               console.log(
                    // ...

                    fn.getMemberUserIdByMatch(message, arguments[0], true)





               )
               message.channel.send(`






               successful`
               )
          .catch(console.error)
          
   ***REMOVED***
}