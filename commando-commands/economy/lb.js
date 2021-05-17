const { Command } = require('discord.js-commando')
const Discord = require('discord.js')
const paginationEmbed = require('discord.js-pagination')

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
            format: 'lb'
        })
    }

    async run(message, args) {

        await mongo().then(async (mongoose) => {
            let lbEmbed = new Discord.MessageEmbed()
                .setAuthor(`${message.guild}'s Leaderboard`, `${this.client.user.displayAvatarURL()}`)
                .setColor(111111)
            try {
                const balances = await economyBalSchema
                    .find({
                        guildID: message.guild.id
                    })
                    .sort({
                        balance: -1
                    })

                const currencySymbol = await helper.getCurrencySymbol()
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
                        )

                        // Fill the length of each page.
                        for(let i = 0; i < 8; i++) {
                            try {
                                embeds[embeds.length-1].addField(`#${rank} ${message.guild.members.cache.get(balances[balCounter].userID).user.tag}`, `${currencySymbol}${balances[balCounter].balance}`)
                                rank++
                                balCounter++  
                            } catch (err) {
                                balCounter++
                                console.log(err)
                            }

                            // If all balances have been inserted, break out of nested loops.
                            if(balCounter >= balances.length) break loop1
                        }
                    }
                
                paginationEmbed(message, embeds, ['⏪', '⏩'], 30000)
            } catch (err) {
                console.log(err)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}