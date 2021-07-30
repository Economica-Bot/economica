const { Command } = require('discord.js-commando')

const util = require('../../features/util')

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
            format: '[length]',
            examples: [
                'clear 10'
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
        if (msgCount > 100 || msgCount < 2) {
            message.channel.send(`Invalid Length: \`${msgCount}\` out of bounds.`).then((message) => {
                setTimeout(() => message.delete(), 4000)
            })
    
            return
        }
    
        await message.channel.bulkDelete(msgCount).catch((err) => {
            message.channel.send({ embed: this.embedify('RED', message.author, message.author.displayAvatarURL(), `${err}`) }).then((message) => {
                setTimeout(() => message.delete(), 4000)
            })
        })
    
        message.channel.send({ embed: this.embedify('GREEN', message.author.username, message.author.displayAvatarURL(), `Deleted ${msgCount} messages.`) }).then((message) => {
            setTimeout(() => message.delete(), 4000)
        })
    }
}