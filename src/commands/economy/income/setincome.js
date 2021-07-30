const { Command } = require('discord.js-commando')
const { MessageCollector, GuildAuditLogsEntry } = require('discord.js')
const util = require('../../../features/util')

const incomeSchema = require('../../../features/schemas/income-sch')
const config = require('../../../config.json')

const { oneLine } = require('common-tags')
const ms = require('ms')

module.exports = class IncomeConfigCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setincome',
            aliases: [
                'set-income'
            ],
            group: 'income',
            memberName: 'setincome',
            guildOnly: true,
            description: 'Configure an income command',
            details: oneLine`After entering a valid income command, a series of prompts will be displayed.
                            The specified income command will return a value between the minimum and 
                            maximum parameters - these values must be nonnegative. 
                            The cooldown time is in ms (1000 per second).`,
            format: '<cmd> [...fields]',
            examples: [
                'setincome work',
                'setincome crime 100 500 10m 60% 200 1000'
            ],
            argsPromptLimit: 0,
            args: [
                {
                    key: 'cmd',
                    prompt: 'Please specify the desired income command.',
                    type: 'command'
              ***REMOVED*** 
                {
                    key: 'fields',
                    prompt: 'Please specify the properties',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    async run(message, { cmd, fields }) {
        const { guild } = message
        let econManagerRole = guild.roles.cache.find(role => {
            return role.name.toLowerCase() === 'economy manager'
        })

        if(!econManagerRole) {
            message.reply('Please create an \`Economy Manager\` role!')
            return
        }

        if(!message.member.roles.cache.has(econManagerRole.id)) {
            message.channel.send({ embed: util.embedify(
                'RED',
                message.author.username, 
                message.author.displayAvatarURL(),
                `You must have the <@&${econManagerRole.id}> role.`
            )} )

            return
        }

        if (cmd.group.id !== 'income') {
            const incomeGroup = this.client.registry.groups.get('income')
            let incomeCommandList = ''
            for (const incomeCommand of incomeGroup.commands) {
                incomeCommandList += `\`${incomeCommand[0]}\`, `
            }

            //get rid of extraneous comma & space 
            incomeCommandList = incomeCommandList.substring(0, incomeCommandList.length - 2)
            message.channel.send({
                embed: util.embedify(
                    'RED',
                    message.author.username,
                    message.author.displayAvatarURL(),
                    `\`${cmd.name}\` is not an income command!`,
                ).addField(
                    'Income commands',
                    `${incomeCommandList}`
                )
            })

            return
        }

        let properties = Object.entries(await util.getCommandStats(guild.id, cmd.name))
        console.log(properties)
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const incomeEmbed = util.embedify(
            'GREEN',
            `Updated ${cmd.name}`,
            this.client.user.displayAvatarURL()
        )

        if (fields) {

            //Convert to string array
            fields = fields.split(' ')
            
            //If provided fields do not match command properties
            if (fields.length !== properties.length) { 
                message.channel.send({ embed: util.embedify(
                    'RED',
                    message.author.username, 
                    message.author.displayAvatarURL(),
                    `Incorrect number of fields: \`${fields.length}\`
                    Format: \`${this.name} ${cmd.name} [${properties.map(x => x[0]).join(' | skip] [')} | skip]\``
                ) })

                return 
            }

            for (let i = 0; i < properties.length; i++) { 
                if(fields[i] === 'skip') {

                } else if(['min', 'max', 'minFine', 'maxFine'].includes(properties[i][0])) { 
                    if(+fields[i]) {
                        fields[i] = +fields[i]
                        properties[i][1] = fields[i]
                        incomeEmbed.addField(
                            `${properties[i][0]}`,
                            `${cSymbol}${fields[i]}`,
                            true
                        )
                    } else {
                        message.reply(`Invalid parameter: \`${fields[i]}\`\n\`${properties[i][0]}\` must be a number!`)
                        return
                    }
                } else if(['cooldown'].includes(properties[i][0])) { 
                    if(ms(fields[i])) {
                        properties[i][1] = ms(fields[i])
                        incomeEmbed.addField(
                            `${properties[i][0]}`,
                            `${ms(ms(fields[i]))}`,
                            true
                        )
                    } else {
                        message.reply(`Invalid parameter: \`${fields[i]}\`\n\`${properties[i][0]}\` must be a time!`)
                        return
                    }
                } else if(['chance'].includes(properties[i][0])) { 
                    if(parseFloat(fields[i])) {
                        fields[i] = parseFloat(fields[i])
                        if(fields[i] < 1) {
                            fields[i] *= 100
                            properties[i][1] = fields[i]
                        } else {
                            properties[i][1] = fields[i] 
                        }

                        incomeEmbed.addField(
                            `${properties[i][0]}`,
                            `${fields[i]}%`,
                            true
                        )
                    } else {
                        message.reply(`Invalid parameter: \`${fields[i]}\`\n\`${properties[i][0]}\` must be a percentage!`)
                        return
                    }
                }
            }

            message.channel.send({ embed: incomeEmbed })
            properties = Object.fromEntries(properties)
            await incomeSchema.findOneAndUpdate({ 
                guildID: guild.id 
          ***REMOVED*** {
                $set: {
                    [cmd.name]: properties
                }
          ***REMOVED*** {
                upsert: true,
                new: true
            }).exec()

            return
        }

        const filter = msg => msg.author.id === message.author.id
        const collector = new MessageCollector(message.channel, filter, {
            time: 1000 * 30
        })
        
        let counter = 0
        const configEmbed = util.embedify(
            'BLURPLE',
            `${cmd.name}`,
            this.client.user.displayAvatarURL(),
            'Current properties:'
        )

        for (const property of properties) {
            let name = `${property[0]}`, value
            if(['min', 'max', 'minFine', 'maxFine'].includes(property[0])) {
                value = `${cSymbol}${property[1]}`
            } else if(property[0] === 'cooldown') {
                value = `${ms(property[1])}`
            } else if(property[0] === 'chance') {
                value = `${property[1]}%`
            }

            configEmbed.addField(
                name,
                value,
                true
            )
        }

        message.channel.send({ embed: configEmbed })
        message.channel.send(`Please define \`${properties[counter++][0]}\`.`)
        collector.on('collect', msg => {
            if(msg.content === 'skip') {

            } else if(['min', 'max', 'minFine', 'maxFine'].includes(properties[counter - 1][0])) {
                if(+msg.content) {
                    properties[counter - 1][1] = +msg.content
                    incomeEmbed.addField(
                        `${properties[counter - 1][0]}`,
                        `${cSymbol}${msg.content}`,
                        true
                    )
                } else {
                    msg.reply(`Invalid parameter: \`${msg.content}\`\n\`${properties[counter - 1][0]}\` must be a number!`)
                    return
                }
            } else if(properties[counter - 1][0] === 'cooldown') {
                if(ms(msg.content)) {
                    properties[counter - 1][1] = ms(msg.content)
                    incomeEmbed.addField(
                        `${properties[counter - 1][0]}`,
                        `${ms(ms(msg.content))}`,
                        true
                    )
                } else {
                    msg.reply(`Invalid parameter: \`${msg.content}\`\n\`${properties[counter - 1][0]}\` must be a time!`)
                    return
                }
            } else if(properties[counter - 1][0] === 'chance') {
                if(parseFloat(msg.content)) {
                    msg.content = parseFloat(msg.content)
                    if(msg.content < 1) {
                        msg.content *= 100
                        properties[counter - 1][1] = msg.content 
                    } else {
                        properties[counter - 1][1] = msg.content 
                    }

                    incomeEmbed.addField(
                        `${properties[counter - 1][0]}`,
                        `${msg.content}%`,
                        true
                    )
                } else {
                    msg.reply(`Invalid parameter: \`${msg.content}\`\n\`${properties[counter - 1][0]}\` must be a percentage!`)
                    return
                }
            }

            if(counter < properties.length) {
                msg.channel.send(`Please define \`${properties[counter++][0]}\``)
            } else {
                collector.stop()
            }
        })

        collector.on('end', async collected => {
            message.channel.send({ embed: incomeEmbed })
            properties = Object.fromEntries(properties)
            util.setCommandStats(guild.id, cmd.name, properties)
        })
    }
}