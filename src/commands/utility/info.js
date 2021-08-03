module.exports = {
    name: 'info', 
    group: 'utility',
    description: 'Send an embed about Economica\'s commands.',
    format: '<group> [channel]',
    permissions: [ 
        'ADMINISTRATOR'
    ],
    global: true, 
    options: [
        {
            name: 'group', 
            description: 'Specify a command group.',
            type: 3, //STRING
            required: true, 
            choices: [
                {
                    name: 'Economy', 
                    value: 'economy'
              ***REMOVED***
                {
                    name: 'Income',
                    value: 'income'
              ***REMOVED***
                {
                    name: 'Market',
                    value: 'market'
              ***REMOVED***
                {
                    name: 'Moderation',
                    value: 'moderation'
              ***REMOVED***
                {
                    name: 'Utility',
                    value: 'utility'
                }
            ]
      ***REMOVED***
        {
            name: 'channel', 
            description: 'Specify a channel.',
            type: 7 //CHANNEL
        }
    ],
    async run(interaction, guild, author, args) {

        let commands = []
        client.commands.forEach(command => {
            if(args[0].value === command.group) {
                commands.push(command)
            }
        })

        const infoEmbed = util.embedify(
            'BLURPLE',
            `${client.user.username} | ${args[0].value} Commands`, 
            client.user.displayAvatarURL(),
        )

        for(const command of commands) {
            infoEmbed.addField(
                `__**${command.name}**__`,
                //If no format, only command name is used
                `**Usage**: \`${command.name}${command.format ? ` ${command.format}` : ''}\`\n>>> *${command.description ? command.description : 'No description.'}*\n\n`
            )
        }

        const channel_id = args[1]?.value ?? interaction.channel_id
        let color = 'GREEN', description = `Successfully sent information for **${args[0].value}** in <#${channel_id}>.`

        guild.channels.cache.get(channel_id).send({ embeds: [infoEmbed] })
            .catch(error => {
                color = 'RED'
                description = error
            })

        embed = util.embedify(
            color, 
            author.user.username,
            author.user.displayAvatarURL(),
            description
        )

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
                flags: 64 //EPHEMERAL
          ***REMOVED***
        }})
    }
}