const { Command } = require('discord.js-commando')

const util = require('../../features/util')
const infractionSch = require('../../features/schemas/infraction-sch')

module.exports = class unBanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            group: 'moderation',
            memberName: 'unban',
            guildOnly: true,
            description: 'Unbans a user',
            format: '<id>',
            examples: [
                'unban 796906750569611294'
            ],
            clientPermissions: [
                'BAN_MEMBERS'
            ],
            userPermissions: [
                'BAN_MEMBERS'
            ],
            argsCount: 1,
            args: [
                {
                    key: 'userID',
                    prompt: 'Please enter the ID of the user you wish to unban.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { userID }) {
        const { guild } = message
        const bannedUser = (await guild.bans.fetch()).get(userID)
        let result
        if(!bannedUser) {
            message.channel.send({ embed: util.embedify(
                'RED',
                guild.name, 
                guild.iconURL(),
                `Could not find banned user \`${userID}\``,
            ) })

            return
        }

        message.channel.send({ embed: util.embedify(
            'GREEN',
            guild.name, 
            guild.iconURL(),
            `Unbanned \`${userID}\``, 
        ) })

        guild.members.unban(userID)

        await infractionSch.updateMany({
            guildID: guild.id,
            userID,
            type: "ban", 
            active: true,
      ***REMOVED*** {
            active: false,
        })
    }
}