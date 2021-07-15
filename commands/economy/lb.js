const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const util = require('../../features/util')

const mongo = require('../../features/mongo')
const economyBalSchema = require('../../features/schemas/economy-bal-sch')

module.exports = class LeaderBoardCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lb',
            aliases: [
                'leaderboard',
                'top'
            ],
            group: 'economy',
            memberName: 'leaderboard',
            guildOnly: true,
            description: 'View top user balances',
        })
    }

    async run(message) {
        await mongo().then(async (mongoose) => {
            try {
                const balances = await economyBalSchema
                    .find({
                        guildID: message.guild.id
                    })
                    .sort({
                        balance: -1
                    })

                const currencySymbol = await util.getCurrencySymbol(message.guild.id)
                
                //amount of entries per page
                let entries = 10
                let embeds = []
                let rank = 1
                let balCounter = 0
                let pageCount = Math.ceil(balances.length / entries)

                loop1:
                    while (true) {
                        
                        //if(balCounter + 1 >= balances.length) break
                        embeds.push(
                            new Discord.MessageEmbed()
                                .setAuthor(`${message.guild}'s Leaderboard`, `${message.guild.iconURL()}`)
                                .setColor(111111)
                                .setFooter(`Page ${embeds.length + 1} / ${pageCount}`)
                        )

                        // Fill the length of each page.
                        for(let i = 0; i < entries; i++) {
                            try {
                                embeds[embeds.length-1].addField(`#${rank++} ${message.guild.members.cache.get(balances[balCounter].userID).user.tag}`, `${currencySymbol}${(balances[balCounter++].balance).toLocaleString()}`)
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
                        .setCustomID('previous_page')
                        .setLabel('Previous')
                        .setStyle('SECONDARY')  
                        .setDisabled(true) 
                )    
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomID('next_page')
                        .setLabel('Next')
                        .setStyle('PRIMARY')
                        .setDisabled(embeds.length > 1 ? false : true)
                )   

                const interactee = await message.channel.send({
                    embed: embeds[0],
                    components: [row]
                })

                let page = 0
                this.client.on('interaction', async interaction => {
                    if(interaction.componentType === 'BUTTON' && interaction.message.id === interactee.id) {
                        if(page < embeds.length - 1 && page >= 0 && interaction.customID === 'next_page') {
                            page++
                            if(page == embeds.length - 1) {
                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('previous_page')
                                            .setLabel('Previous')
                                            .setStyle('SECONDARY')  
                                            .setDisabled(false) 
                                    )     
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('next_page')
                                            .setLabel('Next')
                                            .setStyle('PRIMARY')
                                            .setDisabled(true)
                                    )  

                                interaction.update({
                                    embeds: [embeds[page]],
                                    components: [row]
                                }).catch(err => {
                                    console.error(err)
                                })
                            } else {
                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('previous_page')
                                            .setLabel('Previous')
                                            .setStyle('SECONDARY')  
                                            .setDisabled(false) 
                                    )     
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('next_page')
                                            .setLabel('Next')
                                            .setStyle('PRIMARY')
                                            .setDisabled(false)
                                    ) 

                                interaction.update({ 
                                    embeds: [embeds[page]],
                                    components: [row]
                                }).catch(err => {
                                    console.error(err)
                                })
                            }

                        } else if(page > 0 && page < embeds.length && interaction.customID === 'previous_page') {
                            page--
                            if(page === 0) {
                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('previous_page')
                                            .setLabel('Previous')
                                            .setStyle('SECONDARY')   
                                            .setDisabled(true)
                                    )    
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('next_page')
                                            .setLabel('Next')
                                            .setStyle('PRIMARY')
                                            .setDisabled(false)
                                    )   
                                interaction.update({
                                    embeds: [embeds[page]],
                                    components: [row]
                                }).catch(err => {
                                    console.error(err)
                                })
                            } else {
                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('previous_page')
                                            .setLabel('Previous')
                                            .setStyle('SECONDARY')  
                                            .setDisabled(false) 
                                    )     
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomID('next_page')
                                            .setLabel('Next')
                                            .setStyle('PRIMARY')
                                            .setDisabled(false)
                                    ) 
                                    
                                interaction.update({ 
                                    embeds: [embeds[page]],
                                    components: [row]
                                }).catch(err => {
                                    console.error(err)
                                })
                            }
                        } 
                    } 
                })

            } catch (err) {
                console.error(err)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}