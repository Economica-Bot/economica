const { Command } = require('discord.js-commando');

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
                    key: 'args',
                    prompt: 'Please enter a message to be echoed.',
                    type: 'string'
              ***REMOVED***
            ]
        })
    }

    async run(message, args) {
        console.log(args.args)
        if (args.args.endsWith('true')) {
            return message.channel.send({
                embed: {
                    color: '#2c2f33',
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.avatarURL(),
                  ***REMOVED***
                    description: args.args.substring(0, args.args.length - 4)
                }
            })
        }

        return message.channel.send(args.args);
    }
}