module.exports = {
    name: 'shop',
    description: 'View the server\'s shop items.',
    global: true,
    options: null,
    async run(interaction, guild, author, args) {
        let embed = util.embedify('BLUE', `${guild.name} Shop`, guild.iconURL(), `There are currently \`0\` items in the ${guild.name} shop.\nAsk an admin to add some!`) 

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ],
          ***REMOVED***
        }})
    }
}