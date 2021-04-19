module.exports = {
     aliases: ['ping', 'latency'],
     description: 'Returns the latency in MS',
     callback: (message, arguments, text) => {
          const user = message.author
          message.channel.send(`:ping_pong: **${Date.now() - message.createdTimestamp}**ms <@!${user.id}>`)
     },
}