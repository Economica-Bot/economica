module.exports = {
    commands: ['help', 'Help'],
    callback: (message, arguments, text) => {
         const user = message.author
         message.channel.send({
            embed: {
                 color: 'YELLOW',
                 title: 'Help',
                 description: `Help description`
            }
       })
  ***REMOVED***
}