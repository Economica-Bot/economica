module.exports = {
    name: 'kick',
    description: 'Kicks a user',
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
    global: true,
    async run(interaction, guild, author, args) {
        let content = embed = result = null, reason = args[1]?.value ?? 'No reason provided'
        const member = await guild.members.cache.get(args[0].value)

        if(!author.permissions.has('KICK_MEMBERS')) {
            embed = util.embedify('RED', author.user.username, '', `Missing Permission\n\`KICK_MEMBERS\``)
        } else if (member.permissions.has('KICK_MEMBERS') && !author.permissions.has('ADMINISTRATOR')) {
            embed = util.embedify('RED', author.user.username, '', `Missing Permission\n\`ADMINISTRATOR\``)
        } else if (member.permissions.has('ADMINISTRATOR')) {
            embed = util.embedify('RED', author.user.username, '', `Member is Not Bannable\n\`ADMINISTRATOR\``)
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