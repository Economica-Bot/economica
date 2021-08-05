require('module-alias/register')

const infractionSchema = require('@schemas/infraction-sch')

module.exports = {
    name: 'unban',
    group: 'moderation',
    description: 'Unban a user.',
    format: '<userID>',
    global: true, 
    permissions: [
        'BAN_MEMBERS'
    ],
    options: [
        {
            name: 'user_id', 
            description: 'Specify the ID of a user to unban.',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    async run(interaction, guild, author, options) {
        const userID = options._hoistedOptions[0].value
        const guildBan = (await guild.bans.fetch()).get(userID)

        if(!guildBan) {
            interaction.reply({ embeds: [
                util.embedify(
                    'RED', 
                    guild.name, 
                    guild.iconURL(),
                    `Could not find banned user with ID \`${userID}\`.`
                )
            ] })

            return
        }

        interaction.reply({ embeds: [
            util.embedify(
                'GREEN', 
                guild.name, 
                guild.iconURL(),
                `Unbanned \`${userID}\`.`
            )
        ] })

        guild.members.unban(userID)

        await infractionSchema.updateMany({
            guildID: guild.id, 
            userID, 
            type: "ban", 
            active: true
      ***REMOVED*** {
            active: false
        })
    }
}