module.exports = {
    name: 'ban',
    description: 'Bans a user',
    options: [
        {
            name: 'user',
            description: 'Name a user you wish to ban.',
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
        'BAN_MEMBERS'
    ],
    global: true,
    async run(interaction, guild, author, args) {
        const member = await guild.members.cache.get(args[0].value)
        let content = embed = flags = result = null, reason = args[1]?.value ?? 'No reason provided'

        if (member === author) {
            embed = util.embedify('RED', 'ERROR', author.user.displayAvatarURL(), 'You cannot ban yourself!')
            flags = 64
        } else if (!member.bannable) {
            embed = util.embedify('RED', 'ERROR', author.user.displayAvatarURL(), `<@!${member.user.id}> is not bannable.`)
            flags = 64
        } else {
            //Ban, record, and send message
            await member.send({ embeds: [ util.embedify('RED', guild.name, guild.iconURL(), `You have been **banned** for \`${reason}\`.`) ] })
            .catch((err) => {
                result = `Could not dm ${member.user.tag}.\n\`${err}\``
            })

            embed = util.embedify('GREEN', `Banned ${member.user.tag}`, member.user.displayAvatarURL(), `**Reason**: \`${reason}\``, result ? result : member.user.id)

            member.ban({
                reason
            })
        }

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                content,
                embeds: [ embed ],
                flags
          ***REMOVED***
        }})
    }
}