const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const util = require('../../features/util')

module.exports = class ServersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'servers',
            aliases: [
                'server',
                'listserver',
                'serverlist'
            ],
            group: 'util',
            memberName: 'servers',
            guildOnly: true,
            description: `Returns a list of servers that Economica is apart of.`,
        })
    }

    async run(message, args) {
        let serverCount = 0, memberCount = 0, description = ''

        this.client.guilds.cache.forEach((guild) => {
            serverCount++
            memberCount += guild.memberCount 
            description += `**${guild}** | \`${guild.memberCount.toLocaleString()}\` Members\n`
        })


        message.channel.send({ embed: util.embedify(
            'BLURPLE',
            'Server List',
            this.client.user.displayAvatarURL(),
            description,
            `Servercount: ${serverCount.toLocaleString()} | Membercount: ${memberCount.toLocaleString()}`
        ).setTimestamp() })
    }
}