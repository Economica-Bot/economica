const { Command } = require('discord.js-commando');

module.exports = class EchoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'echo',
            group: 'utility',
            memberName: 'echo',
            description: 'Echo arguments',
        })
    }

    async run(message, args) {
        if (args.endsWith('--embed') || args.endsWith('--e')) {
            args = args.substr(0, args.indexOf('--embed'));
            return message.channel.send({
                embed: {
                    color: '#2c2f33',
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.avatarURL(),
                  ***REMOVED***
                    description: args
                }
            })
        }
        return message.channel.send(args);
    }
}