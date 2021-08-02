const Discord = require('discord.js')

const econonomySchema = require('../../util/mongo/schemas/economy-sch')

module.exports = {
    name: 'leaderboard', 
    description: 'View top users in the economy.',
    global: true, 
    format: '[wallet | treasury | networth]', 
    options: [
        {
            name: 'type', 
            description: 'Specify the leaderboard type.',
            type: 3,
            choices: [
                {
                    name: 'Wallet',
                    value: 'wallet'
              ***REMOVED***
                {
                    name: 'Treasury', 
                    value: 'treasury'
              ***REMOVED***
                {
                    name: 'Networth', 
                    value: 'networth'
                }
            ],
            required: true
        }
    ],
    async run(interaction, guild, author, args) {
        const currencySymbol = await util.getCurrencySymbol(guild.id)
        const balances = await econonomySchema.find({ guildID: guild.id }).sort({ [args[0].value]: -1 })

        //amount of entries per page
        let entries = 10, embeds = [], rank = 1, balCounter = 0, pageCount = Math.ceil(balances.length / entries)

        loop1:
            while(true) {
                embeds.push(
                    new Discord.MessageEmbed()
                        .setAuthor(`${guild}'s ${args[0].value[0].toUpperCase() + args[0].value.substring(1)} Leaderboard`, `${guild.iconURL()}`)
                        .setColor(111111)
                        .setFooter(`Page ${embeds.length + 1} / ${pageCount}`)
                )

                // Fill the length of each page.
                for(let i = 0; i < entries; i++) {
                    try {
                        const member = await guild.members.fetch(balances[balCounter].userID)
                        embeds[embeds.length-1]
                            .addField(
                                `#${rank++} ${member.user.tag}`, 
                                `${currencySymbol}${balances[balCounter++][args[0].value].toLocaleString()}`
                            )
                    } catch (err) {
                        balCounter++
                        embeds[0].setDescription(`\`0\` users on leaderboard.`)
                        console.log(err)
                    }

                    // If all balances have been inserted, break out of nested loops.
                    if(balCounter >= balances.length) break loop1
                }
            }
        
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('previous_page')
                    .setLabel('Previous')
                    .setStyle('SECONDARY')  
                    .setDisabled(true) 
            )    
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('next_page')
                    .setLabel('Next')
                    .setStyle('PRIMARY')
                    .setDisabled(embeds.length > 1 ? false : true)
            )   

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embeds[0] ],
                components: [ row ],
                flags: 64
          ***REMOVED***
        }})

        let page = 0

        // client.ws.on('INTERACTION_CREATE', async interaction => {
        //     console.log(interaction)
        // })

        // return
        client.ws.on('INTERACTION_CREATE', async interaction => {
            if(interaction.data.component_type === 2) {
                if(page < embeds.length - 1 && page >= 0 && interaction.data.custom_id === 'next_page') {
                    page++
                    if(page == embeds.length - 1) {
                        const row = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('previous_page')
                                    .setLabel('Previous')
                                    .setStyle('SECONDARY')  
                                    .setDisabled(false) 
                            )     
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('next_page')
                                    .setLabel('Next')
                                    .setStyle('PRIMARY')
                                    .setDisabled(true)
                            )  


                        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                            type: 4,
                            data: {
                                embeds: [embeds[page]],
                                components: [row],
                                flags: 64
                          ***REMOVED***
                        }})
                    } else {
                        const row = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('previous_page')
                                    .setLabel('Previous')
                                    .setStyle('SECONDARY')  
                                    .setDisabled(false) 
                            )     
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('next_page')
                                    .setLabel('Next')
                                    .setStyle('PRIMARY')
                                    .setDisabled(false)
                            ) 

                        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                            type: 4,
                            data: {
                                embeds: [embeds[page]],
                                components: [row],
                                flags: 64
                          ***REMOVED***
                        }})
                    }

                } else if(page > 0 && page < embeds.length && interaction.data.custom_id === 'previous_page') {
                    page--
                    if(page === 0) {
                        const row = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('previous_page')
                                    .setLabel('Previous')
                                    .setStyle('SECONDARY')   
                                    .setDisabled(true)
                            )    
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('next_page')
                                    .setLabel('Next')
                                    .setStyle('PRIMARY')
                                    .setDisabled(false)
                            )   

                        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                            type: 4,
                            data: {
                                embeds: [embeds[page]],
                                components: [row],
                                flags: 64
                          ***REMOVED***
                        }})
                    } else {
                        const row = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('previous_page')
                                    .setLabel('Previous')
                                    .setStyle('SECONDARY')  
                                    .setDisabled(false) 
                            )     
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('next_page')
                                    .setLabel('Next')
                                    .setStyle('PRIMARY')
                                    .setDisabled(false)
                            ) 
                            
                        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                            type: 4,
                            data: {
                                embeds: [embeds[page]],
                                components: [row],
                                flags: 64
                          ***REMOVED***
                        }})
                    }
                } 
            }
        })
    }
}