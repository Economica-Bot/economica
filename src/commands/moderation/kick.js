require('module-alias/register')

const infractionSchema = require('@schemas/infraction-sch')

module.exports = {
    name: 'kick',
    group: 'moderation',
    description: 'Kicks a user',
    global: true,
    permissions: [ 
        'KICK_MEMBERS'
    ],
    options: [
        {
            name: 'user',
            description: 'Name a user you wish to kick.',
            type: 6, 
            required: true
      ***REMOVED*** 
        {
            name: 'reason', 
            description: 'Provide a reason.',
            type: 3,
        }    
    ],
    async run(interaction, guild, author, options) {
        const member = options._hoistedOptions[0].member
        let embed = flags = result = null, ephemeral = false, reason = options._hoistedOptions[1]?.value ?? 'No reason provided'

        if (member.user.id === author.user.id) {
            embed = util.embedify('RED', author.user.username, author.user.displayAvatarURL(), 'You cannot kick yourself!')
            ephemeral = true
        } else if (!member.kickable) {
            embed = util.embedify('RED', author.user.username, author.user.displayAvatarURL(), `<@!${member.user.id}> is not kickable.`)
            ephemeral = true
        } else {
            //Kick, record, and send message
            await member.send({ embeds: [ util.embedify('RED', guild.name, guild.iconURL(), `You have been **kicked** for \`${reason}\`.`) ] })
            .catch((err) => {
                result = `Could not dm ${member.user.tag}.\n\`${err}\``
            })

            embed = util.embedify('GREEN', `Kicked ${member.user.tag}`, member.user.displayAvatarURL(), `**Reason**: \`${reason}\``, result ? result : member.user.id)

            member.kick({
                reason
            })

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