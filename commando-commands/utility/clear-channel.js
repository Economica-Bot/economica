const { Command } = require('discord.js-commando')

module.exports = class ClearChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clear',
            aliases: [
                'cc',
                'clearchannel'
            ],
            memberName: 'clear',
            group: 'utility',
            description: 'Clears channel',
            details: 'Deletes a number of messages in a channel. If not specified, deletes all messages <=2 Weeks old.',
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

        if(msgCount > 100 || msgCount < 2) {
            return message.channel.send(`Invalid Length: \`${msgCount}\` out of bounds.`)
        }

        await message.channel.bulkDelete(msgCount)

        await message.channel.send(`Deleted ${msgCount} messages.`).then((message) => {
            message.delete({
                timeout: 2000
            })
        })
    }
}