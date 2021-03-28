module.exports = {
     commands: ['ping', 'latency'],
     callback: (message, arguments, text) => {
          const user = message.author
          message.channel.send(`:ping_pong: **${Date.now() - message.createdTimestamp}**ms <@!${user.id}>`)
   ***REMOVED***
}