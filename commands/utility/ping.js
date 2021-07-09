const { Command } = require('discord.js-commando')

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
        message.channel.send(`Pong! \`${new Date().getTime() - message.createdTimestamp}ms\``)
    }
}