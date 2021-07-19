const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const { escapeMarkdown } = require('discord.js')

module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            group: 'util',
            guildOnly: false, 
            memberName: 'information',
            description: 'Send an embed about Economica in a specified channel.',
            userPermissions: [
                'ADMINISTRATOR'
            ],
            args: [
                {
                    key: 'group',
                    prompt: 'Please name a command group.',
                    type: 'string'
              ***REMOVED***
                {
                    key: 'channel',
                    prompt: 'Please mention the channel you wish to send the information in.',
                    type: 'channel',
                }
            ]
        })
    }

    async run(message, { group, channel }) {
        const cmdGroup = this.client.registry.findGroups(group)
        if(!cmdGroup.length) {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL(),
                `Could not find command group: \`${group}\``
            ) })

            return
        }

        const owners = this.client.owners
        const ownersList = owners.map((user, i) => {
            return `${user.username}#${user.discriminator}`
        }).join(' or ')
        const infoEmbed = util.embedify(
            'BLURPLE',
            `${this.client.user.username} | ${cmdGroup[0].name} Commands`, 
            this.client.user.displayAvatarURL(),
        )

        for(const command of cmdGroup[0].commands) {
            infoEmbed.addField(
                `__**${command[1].name}**__ - *${command[1].description ? command[1].description : 'No description.'}*`,
                //If no format, only command name is used
                `**Usage**: \`${command[1].name}${command[1].format ? ` ${command[1].format}` : ''}\`\n>>> ${command[1].details ? command[1].details : 'No details.'}\n\n`
            )
        }

        channel.send({ embed: infoEmbed })
    }
}