const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const helper = require('../../features/helper')

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
            description: 'Returns leader board',
            details: 'View top balances.',
            format: ''
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

                const currencySymbol = await helper.getCurrencySymbol(message.guild.id)
                let embeds = []
                let rank = 1
                let balCounter = 0

                loop1:
                    while (true) {
                        
                        //if(balCounter + 1 >= balances.length) break
                        embeds.push(
                            new Discord.MessageEmbed()
                                .setAuthor(`${message.guild}'s Leaderboard`, `${this.client.user.displayAvatarURL()}`)
                                .setColor(111111)
                                .setFooter(`Page ${embeds.length + 1}`)
                        )

                        // Fill the length of each page.
                        for(let i = 0; i < 8; i++) {
                            try {
                                embeds[embeds.length-1].addField(`#${rank++} ${message.guild.members.cache.get(balances[balCounter].userID).user.tag}`, `${currencySymbol}${balances[balCounter++].balance}`)
                            } catch (err) {
                                balCounter++
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
                )    
                .addComponents(
                        new Discord.MessageButton()
                            .setCustomID('next_page')
                            .setLabel('Next')
                            .setStyle('PRIMARY')
                )   

                await message.channel.send({
                    embed: embeds[0],
                    components: [row]
                })

                let i = 0
                this.client.on('interaction', async interaction => {
                    if(interaction.componentType === 'BUTTON' && interaction.guildID === message.guild.id) {
                        if(i < embeds.length - 1 && i >= 0 && interaction.customID === 'next_page') {
                            interaction.update({ 
                                embeds: [embeds[++i]] 
                            }).catch(err => {
                                console.err(err)
                            })
                        } else if(i > 0 && i < embeds.length && interaction.customID === 'previous_page') {
                            interaction.update({ 
                                embeds: [embeds[--i]] 
                            }).catch(err => {
                                console.log(err)
                            })
                        } else {
                            interaction.reply('Out of bounds.').then(
                                setTimeout(() => interaction.deleteReply(), 2000)
                            )
                        }
                    }
                })

            } catch (err) {
                console.log(err)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}