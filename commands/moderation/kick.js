module.exports = {
    aliases: ['kick'],
    description: 'Kicks a user',
    expectedArgs: '<user> <reason>',
    exUse: 'kamaji',
    minArgs: 1,
    maxArgs: 10, 
    permissions: ['KICK_MEMBERS'],
    callback: (message, arguments, text) => {

        const {member, mentions } = message
        const target = mentions.users.first();
        const tag = `<@${member.id}>`
        if(target) {
            const targetMember = message.guild.members.cache.get(target.id)
            targetMember.kick()

            if(text.split(" ").splice(1).join(' '))
                message.channel.send(`Kicked ${target.tag} for \`${text.split(" ").splice(1).join(' ')}\``)
            else 
                message.channel.send(`Kicked ${target.tag}`)

        } else {
            message.channel.send(`${tag}, Please specify someone to kick`)
        }

  ***REMOVED***
}