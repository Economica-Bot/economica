const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

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
            format: 'servers',
        })
    }

    async run(message, args) {
        let serversEmbed = new Discord.MessageEmbed()
            .setTitle('Server List')
            .setFooter('Wow, much numbers')
            .setColor(1128456)
            .setTimestamp()

        this.client.guilds.cache.forEach((guild) => {
            serversEmbed.addFields(
                {
                    name:`**${guild}**`,
                    value: `Member Count: \`${guild.memberCount}\``
                }
            )
        })
        message.channel.send({ embed: serversEmbed })
    }
}