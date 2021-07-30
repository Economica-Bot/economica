const { Command } = require('discord.js-commando')

const util = require('../../features/util')

module.exports = class EchoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'echo',
            group: 'util',
            memberName: 'echo',
            description: 'Repeats a message',
            details: 'If the last word in the message is \`true\`, the echo will be within an embed.',
            format: '<message> [true]',
            examples: [
                'echo Economica',
                'echo Economica true'
            ],
            args: [
                {
                    key: 'message',
                    prompt: 'Please enter a message to be echoed.',
                    type: 'string'
              ***REMOVED***
            ]
        })
    }

    async run(message, { text }) {
        if (text.endsWith('true')) {
            message.channel.send({ embed: util.embedify(
                'BLURPLE',
                message.author.username, 
                message.author.displayAvatarURL(),
                text.slice(-4)
            ) })

            return
        }

        message.channel.send(text)
    }
}