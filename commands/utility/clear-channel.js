const { Command } = require('discord.js-commando')

const helper = require('../../features/helper')

module.exports = class ClearChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clear',
            aliases: [
                'cc',
                'clearchannel'
            ],
            memberName: 'clear',
            group: 'util',
            description: 'Clears channel',
            details: 'Deletes a number of messages in a channel. If not specified, deletes all messages <=2 Weeks old.',
            format: 'clear [length]',
            examples: [
                'clear [length]'
            ],
            userPermissions: [
                'MANAGE_MESSAGES'
            ],
            clientPermissions: [
                'MANAGE_MESSAGES'
            ],
            argsCount: 1,
            args: [
                {
                    key: 'msgCount',
                    prompt: 'Specify the count of messages to delete, between 0 and 100.',
                    type: 'integer',
                    default: '100'
                }
            ]
        })
    }

    async run(message, { msgCount }) {
        helper.deleteMessages(message, msgCount)
    }
}