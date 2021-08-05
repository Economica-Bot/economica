const guildSettingSchema = require('@schemas/guild-settings-sch')

module.exports = {
    name: 'transaction-log',
    group: 'economy', 
    description: 'View and designate a transaction logging channel.',
    format: '<channel>',
    global: true, 
    permissions: [
        'ADMINISTRATOR'
    ],
    options: [
        {
            name: 'channel', 
            description: 'Specify a channel to log transactions.',
            type: 7,
        }
    ],
    async run(interaction, guild, author, options) {
        let color, description, channel = options._hoistedOptions?.[0]?.channel

        const guildID = guild.id
        const currChannelID = await guildSettingSchema.findOne({
            guildID,
        })?.transactionLogChannel
        
        if(!channel) {
            color = 'BLURPLE'
            description = currChannelID ? `The transaction log channel is: <#${currChannelID}>` : 'There is no transaction log channel configured.'
        } else if (channel.id === currChannelID) {
            color = 'RED' 
            description = `<#${channel.id}> is already the transaction log channel.`
        } else if (channel.type !== 'GUILD_TEXT') {
            color = 'RED'
            description = `<#${channel.id}> is not a text channel.`
        } else {
            color = 'GREEN'
            description = `Transaction log channel set to <#${channel.id}>`
            await guildSettingSchema.findOneAndUpdate({
                guildID 
          ***REMOVED*** {
                transactionLogChannel: channel.id
            })
        }

        const embed = util.embedify(
            color, 
            guild.name, 
            guild.iconURL(), 
            description
        )
        
        interaction.reply({ embeds: [ embed ] })
    }
}