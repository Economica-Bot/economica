module.exports = {
    commands: ['clearchannel', 'clear'],
    expectedArgs: 'none',
    exUse: 'clearchannel',
    description: 'Deletes all messages sent in the last 14 days.',
    callback: (message, arguments, text) => {
        message.channel.messages.fetch().then((content) => {
            message.channel.bulkDelete(content)
        })
    },
}