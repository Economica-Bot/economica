module.exports = {
    name: 'kick',
    group: 'moderation',
    description: 'Kicks a user',
    global: true,
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
    permissions: [ 
        'KICK_MEMBERS'
    ],
    async run(interaction, guild, author, args) {
        let content = embed = result = null, reason = args[1]?.value ?? 'No reason provided'
        const member = await guild.members.cache.get(args[0].value)

        if (member === author) {
            embed = util.embedify('RED', 'ERROR', author.user.displayAvatarURL(), 'You cannot kick yourself!')
            flags = 64
        } else if (!member.kickable) {
            embed = util.embedify('RED', 'ERROR', author.user.displayAvatarURL(), `<@!${member.user.id}> is not kickable.`)
            flags = 64
        } else {
            //Ban, record, and send message
            await member.send({ embeds: [ util.embedify('RED', guild.name, guild.iconURL(), `You have been **kicked** for \`${reason}\`.`) ] })
            .catch((err) => {
                result = `Could not dm ${member.user.tag}.\n\`${err}\``
            })

            embed = util.embedify('GREEN', `Kicked ${member.user.tag}`, member.user.displayAvatarURL(), `**Reason**: \`${reason}\``, result ? result : member.user.id)

            member.kick({
                reason
            })
        }

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
            content,
            embeds: [ embed ],
          ***REMOVED***
        }})
    }
}