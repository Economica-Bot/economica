const { Command } = require('discord.js-commando')
const { MessageCollector } = require('discord.js')
const util = require('../../../features/util')

const incomeSchema = require('../../../features/schemas/income-sch')
const config = require('../../../config.json')
const mongo = require('../../../features/mongo')

const { oneLine } = require('common-tags')

module.exports = class IncomeConfigCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'config',
            aliases: [
                'configure'
            ],
            group: 'income',
            memberName: 'configure',
            guildOnly: true,
            description: 'Configure an income command',
            details: oneLine`After entering a valid income command, a series of prompts will be displayed.
                            The specified income command will return a value between the minimum and 
                            maximum parameters - these values must be nonnegative. 
                            The cooldown time is in ms (1000 per second).`,
            format: '<cmd> <...properties>',
            examples: [
                'configure work ...',
                'set-income crime ...'
            ],
            argsPromptLimit: 0,
            argsCount: 3,
            args: [
                {
                    key: 'cmd',
                    prompt: 'Please specify the desired income command.',
                    type: 'command'
                }
            ]
        })
    }

    async run(message, { cmd }) {
        if (cmd.group.id !== 'income') {
            const incomeGroup = this.client.registry.groups.get('income')
            let incomeCommandList = []
            for (const incomeCommand of incomeGroup.commands) {
                incomeCommandList += `\`${incomeCommand[0]}\`, `
            }

            //get rid of extraneous comma & space 
            incomeCommandList = incomeCommandList.substring(0, incomeCommandList.length - 2)

            message.channel.send({
                embed: util.embedify(
                    'RED',
                    message.author.tag,
                    message.author.displayAvatarURL(),
                    `\`${cmd.name}\` is not an income command!`,
                ).addField(
                    'Income commands',
                    `${incomeCommandList}`
                )
            })
            return
        }

        const properties = Object.entries(config.income[cmd.name])
        const filter = msg => msg.author.id === message.author.id
        const collector = new MessageCollector(message.channel, filter, {
            max: properties.length,
            time: 1000 * 30
        })
        let exit = false, counter = 0
        let configEmbed = util.embedify(
            'BLURPLE',
            `${cmd.name}`, 
            this.client.user.displayAvatarURL(),
            'Current properties:'
        ) 
        for(const property of properties) {
            configEmbed.addField(
                `${property[0]}`,
                `${property[1]}`,
                true
            )
        }
        message.channel.send({ embed: configEmbed })
        message.channel.send(properties[counter++][0])
        collector.on('collect', msg => {
            if (counter < properties.length) {
                msg.channel.send(properties[counter++][0])
            }
        })

        var obj = {}

        collector.on('end', async collected => {
            counter = 0
            collected.every((property) => {
                if(!parseInt(property)) {
                    message.reply(`${property} is not a number!`)
                    exit = true
                    return false
                }

                properties[counter++][1] = parseInt(property.content)
                return true
            })

            if(exit) {
                return
            }

            for (let i = 0; i < properties.length; i++) {
                obj[properties[i][0]] = properties[i][1]
            }

            await mongo().then(async (mongoose) => {
                try {
                    await incomeSchema.findOneAndUpdate({ _id: message.guild.id }, {
                        //update a specific field:
                        $set: {
                            [cmd.name]: obj 
                        }
                  ***REMOVED*** {
                        new: true,
                        upsert: true
                    }).exec()
                } catch (err) {
                    console.error(err)
                } finally {
                    mongoose.connection.close()
                }
            })

            const incomeEmbed = util.embedify(
                'GREEN',
                `Updated ${cmd.name}`,
                this.client.user.displayAvatarURL()
                )
            for (const property of properties) {
                incomeEmbed.addField(`${property[0]}`, `${property[1]}`, true)
            }

            message.channel.send({ embed: incomeEmbed })
        })
    }
}