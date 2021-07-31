module.exports = {
    name: 'bal',
    description: 'View a balance.',
    options: [
        {
            name: 'user',
            description: 'Name a user you wish to see the balance of.',
            type: 6
        }
    ], 
    global: true, 
    async run(interaction) {
        const guild = await client.guilds.fetch(interaction.guild_id)
        const member = await guild.members.cache.get(interaction.data.options?.[0].value) 
                    ?? await guild.members.cache.get(interaction.member.user.id)

        const cSymbol = await util.getCurrencySymbol(guild.id)
        const { wallet, treasury, networth, rank } = await util.getEconInfo(guild.id, member.user.id)
        const balEmbed = util.embedify('GOLD', member.user.username, member.user.displayAvatarURL(), '', `🏆 Rank ${rank}`)
            .addFields([
                {
                    name: 'Wallet',
                    value: `${cSymbol}${wallet.toLocaleString()}`,
                    inline: true
              ***REMOVED***
                {
                    name: 'Treasury',
                    value: `${cSymbol}${treasury.toLocaleString()}`,
                    inline: true
              ***REMOVED***
                {
                    name: 'Net Worth',
                    value: `${cSymbol}${networth.toLocaleString()}`,
                    inline: true
                }
            ])

            await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 4,
                data: {
                embeds: [ balEmbed ],
              ***REMOVED***
            }})
    }
}