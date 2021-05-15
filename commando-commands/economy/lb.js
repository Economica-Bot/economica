const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const helper = require('../../helper')

const mongo = require('../../mongo')
const economyBalSchema = require('../../schemas/economy-bal-sch')

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
                let rank = 0
                for(const balance of balances) {
                    rank++
                    lbEmbed.addField(
                        `**Rank ${rank}** | ${await helper.getMemberUserById(message, balance.userID).tag}`, `Balance: ${await helper.getCurrencySymbol(message.guild.id)}${await balance.balance}`
                    )             
                }
            } catch (err) {
                console.log(err)
            } finally {
                mongoose.connection.close()
            }
            message.say(lbEmbed)
        })
        
    }
}