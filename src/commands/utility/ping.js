const { Command } = require('discord.js-commando')

const util = require('../../features/util')

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'util',
            memberName: 'ping',
            description: "Returns the latency of the bot's connection.",
        })
    }

    async run(message) {
        message.channel.send('Pinging...').then(msg => {
            msg.edit({ content: null, embed: util.embedify(
                'GREEN',
                message.author.username,
                message.author.displayAvatarURL(),
                `Pong! \`${msg.createdTimestamp - message.createdTimestamp}ms\``,
            ) })
        })
    }
}