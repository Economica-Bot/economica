const { Command } = require('discord.js-commando')
const { MessageCollector } = require('discord.js')
const util = require('../../../features/util')

const incomeSchema = require('../../../features/schemas/income-sch')
const config = require('../../../config.json')
const mongo = require('../../../features/mongo')

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
            format: '<cmd> [shorthand]',
            examples: [
                'setincome work',
                'setincome crime 100 500 10m 60% 200 1000'
            ],
            argsPromptLimit: 0,
            argsCount: 3,
            args: [
                {
                    key: 'cmd',
                    prompt: 'Please specify the desired income command.',
                    type: 'command'
              ***REMOVED*** {
                    key: 'fields',
                    prompt: 'Please specify the fields',
                    type: 'string',
                    default: 'all'
                }
            ]
        })
    }

    async run(message, { cmd, fields }) {
        let econManagerRole = message.guild.roles.cache.find(role => {
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

        let dbProperties = await util.getCommandStats(message.guild.id, cmd.name, true, false) // properties from db
        const properties = Object.entries(dbProperties) // same values as the variable you were using @Adrastopoulos
        const cSymbol = await util.getCurrencySymbol(message.guild.id, false)

        try {
            if (fields !== 'all') {
                let c = 0
                const tempFields = fields // retain original untrimmed fields
                fields = util.argify(fields, properties.length)

                if (fields.length !== Object.keys(config.income[cmd.name]).length) { // ensure the correct number of fields were provided
                    const dispProperties = Object.keys(config.income[cmd.name])
                    return util.errorEmbed(message, `You've included an incorrect number of fields (\`${util.argify(tempFields).length}\`).\nCorrect format: \`${cmd.name} [${dispProperties.join('|skip] [')}|skip]\``, this.name)
                }

                console.log('fields', fields)
                for (let f in fields) { // loop thru all fields and validate them
                    console.log(fields[f])
                    f = fields[f]
                    const tempf = f
                    if (f !== 'skip') {
                        if (['min', 'max', 'minFine', 'maxFine'].includes(Object.keys(dbProperties)[c])) {
                            f = parseInt(f)
                            if (isNaN(tempf)) return message.reply(`\`${tempf}\` is invalid. \`${properties[c][0]}\` must be a number!`)
                        } else if (['cooldown'].includes(Object.keys(dbProperties)[c])) {
                            f = util.parseDuration(f)
                            if (!f) return message.reply(`\`${tempf}\` is invalid. \`${properties[c][0]}\` must be a number or duration!`)
                        } else if (['chance'].includes(Object.keys(dbProperties)[c])) {
                            f = util.parsePercentage(f)
                            if (!f) return message.reply(`\`${tempf}\` is invalid. \`${properties[c][0]}\` must be a number or percentage!`)
                        } else {
                            return message.reply(`Something went wrong :bug: There doesn't seem to be a property named \`${properties[c][0]}\`. Please contact us here: ${config.discord}`)
                        }
                    } else f = dbProperties[properties[c][0]]
                    dbProperties[properties[c][0]] = f
                    console.log(dbProperties)
                    c++
                }

                delete dbProperties['$init'] // destroy this random property. Easier than ignoring it in embed by loop

                dbProperties = util.fixIncome(dbProperties)

                await util.setCommandStats(message.guild.id, cmd.name, util.trimObj(dbProperties, [undefined, null]), true)

                dbProperties = util.beautifyIncome(dbProperties, cSymbol)

                const incomeEmbed = util.embedify(
                    'GREEN',
                    `Updated ${cmd.name}`,
                    this.client.user.displayAvatarURL()
                )

                for (const property in dbProperties) {
                    incomeEmbed.addField(`${property}`, `${dbProperties[property]}`, true)
                }

                return message.channel.send({ embed: incomeEmbed })
            }
        } catch (e) {
            console.log(e)
            return message.reply('Something went wrong :bug:')
        }

        const filter = msg => msg.author.id === message.author.id
        const collector = new MessageCollector(message.channel, filter, {
            max: Object.keys(config.income[cmd.name]).length,
            time: 1000 * 30
        })
        let exit = false, counter = 0
        let configEmbed = util.embedify(
            'BLURPLE',
            `${cmd.name}`,
            this.client.user.displayAvatarURL(),
            'Current properties:'
        )
        for (const property of properties) {
            if (property[0] !== '$init') {
                configEmbed.addField(
                    `${property[0]}`,
                    `${property[1]}`,
                    true
                )
            }
        }
        message.channel.send({ embed: configEmbed })
        message.channel.send(`Please define \`${properties[counter++][0]}\`. Type 'skip' to skip.`)
        collector.on('collect', msg => {
            const tempmsg = msg.content
            if (msg.content !== 'skip') {
                if (msg.content !== 'skip') {
                    if (['min', 'max', 'minFine', 'maxFine'].includes(Object.keys(dbProperties)[counter - 1])) {
                        msg.content = parseInt(msg.content)
                        if (isNaN(tempmsg)) return message.reply(`\`${tempmsg}\` is invalid. \`${properties[counter - 1][0]}\` must be a number!`)
                    } else if (['cooldown'].includes(Object.keys(dbProperties)[counter - 1])) {
                        msg.content = util.parseDuration(msg.content)
                        if (!msg.content) return message.reply(`\`${tempmsg}\` is invalid. \`${properties[counter - 1][0]}\` must be a number or duration!`)
                    } else if (['chance'].includes(Object.keys(dbProperties)[counter - 1])) {
                        msg.content = util.parsePercentage(msg.content)
                        if (!msg.content) return message.reply(`\`${tempmsg}\` is invalid. \`${properties[counter - 1][0]}\` must be a number or percentage!`)
                    } else {
                        return message.reply(`Something went wrong :bug: There doesn't seem to be a property named \`${properties[counter - 1][0]}\`. Please contact us here: ${config.discord}`)
                    }
                } else msg.content = dbProperties[properties[counter - 1][0]]
                dbProperties[properties[counter - 1][0]] = msg.content
                console.log(dbProperties)
            }
            if (counter < Object.keys(config.income[cmd.name]).length) {
                msg.channel.send(`Please define \`${properties[counter++][0]}\`. Type 'skip' to skip.`)
            }
        })

        let obj = {} 

        collector.on('end', async collected => {
            counter = 0
            collected.every((property) => {
                properties[counter++][1] = parseInt(property.content)
                return true
            })

            if (exit) {
                return
            }

            for (let i = 0; i < properties.length; i++) {
                obj[properties[i][0]] = properties[i][1]
            }

            util.fixIncome(obj)

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

            util.beautifyIncome(obj, cSymbol)

            const incomeEmbed = util.embedify(
                'GREEN',
                `Updated ${cmd.name}`,
                this.client.user.displayAvatarURL()
            )
            for (const property in obj) {
                if (property !== '$init') incomeEmbed.addField(`${property}`, `${obj[property]}`, true)
            }

            message.channel.send({ embed: incomeEmbed })
        })
    }
}