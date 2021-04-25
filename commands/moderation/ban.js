module.exports = {
    aliases: ['ban'],
    description: 'Bans a user',
    expectedArgs: '<user> [length]',
    exUse: 'kamaji 10d',
    minArgs: 1,
    maxArgs: 2, 
    permissions: ['BAN_MEMBERS'],
    callback: (message, arguments, text) => {

        const {member, mentions } = message
        const target = mentions.users.first();
        const tag = `<@${member.id}>`
        if(target) {
            const targetMember = message.guild.members.cache.get(target.id)
            targetMember.ban()

            if(text.split(" ").splice(1).join(' '))
                message.channel.send(`Banned user ${arguments[0]} for \`${text.split(" ").splice(1).join(' ')}\``)
            else 
                message.channel.send(`Banned ${arguments[0]}`)
                
        } else {
            message.channel.send(`${tag}, Please specify someone to ban`)
        }

    },
}