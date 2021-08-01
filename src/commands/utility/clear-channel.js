module.exports = {
    name: 'clear',
    description: 'Deletes a number of messages in a channel. If not specified, deletes all messages <= 2 weeks old.',
    options: [
        {
            name: 'msgcount',
            description: 'The count of messages to delete, between 0 and 100.',
            type: 4, //integer
            required: false, 
        }
    ],
    global: true, 
    async run(interaction, guild, author, args) {
        let content = null, embed = null, msgCount = args?.[0].value ?? 100
        if (msgCount && msgCount > 100 || msgCount < 0) {
            embed = util.embedify('RED', author.user.username, author.user.displayAvatarURL(), `Invalid Length: \`${msgCount}\` out of bounds.`)
        } else {
            const channel = await client.channels.fetch(interaction.channel_id)
    
            await channel.bulkDelete(msgCount)
                .then((val) => {
                    embed = util.embedify('GREEN', author.user.username, author.user.displayAvatarURL(), `Deleted \`${val.size}\` messages.`) 
                })
                .catch((err) => {
                    embed = util.embedify('RED', author.user.username, author.user.displayAvatarURL(), `\`\`\`js\n${err}\`\`\``)
                })
        }

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              content,
              embeds: [ embed ],
              flags: '64' //ephemeral
          ***REMOVED***
        }})
    }
}