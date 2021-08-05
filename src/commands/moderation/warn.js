

const infractionSchema = require('@schemas/infraction-sch')

module.exports = {
    name: 'warn',
    group: 'moderation',
    description: 'Warn a user.',
    format: '<user> [reason]',
    permissions: [
        'MUTE_MEMBERS'
    ],
    global: true,
    options: [
        {
            name: 'user',
            description: 'Name a user you wish to warn.',
            type: 6,
            required: true
      ***REMOVED***
        {
            name: 'reason',
            description: 'Provide a reason.',
            type: 3
        }
    ],
    async run(interaction, guild, author, options) {
        const member = options._hoistedOptions[0].member
        let embed = result  = null, ephemeral = false, reason = options._hoistedOptions?.[1]?.value ?? 'No reason provided'

        if (member.user.id === author.user.id) {
            embed = util.embedify('RED', author.user.username, author.user.displayAvatarURL(), 'You cannot warn yourself!')
            ephemeral = true
        } else {
            //Warn, record, and send message
            await member.send({ embeds: [ util.embedify('RED', guild.name, guild.iconURL(), `You have been **warned** for \`${reason}\`.`) ] })
            .catch((err) => {
                result = `Could not dm ${member.user.tag}.\n\`${err}\``
            })

            embed = util.embedify('GREEN', `Warned ${member.user.tag}`, member.user.displayAvatarURL(), `**Reason**: \`${reason}\``, result ? result : member.user.id)

            await new infractionSchema({
                guildID: guild.id,
                userID: member.id,
                userTag: member.user.tag, 
                staffID: author.user.id,
                staffTag: author.user.tag,
                type: this.name,
                reason,
            }).save()
        }

        await interaction.reply({
            embeds: [ embed ], 
            ephemeral
        })
    }
}