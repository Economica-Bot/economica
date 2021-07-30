const { User, Guild, Message, MessageEmbed, GuildMember } = require('discord.js')
const { Client, CommandoMessage, CommandoGuild, util } = require('discord.js-commando')
const ms = require('ms')

const config = require('../config.json')

const economySchema = require('./schemas/economy-sch')
const guildSettingSchema = require('./schemas/guild-settings-sch')
const incomeSchema = require('./schemas/income-sch')

/**
 * Returns the id of the message guild member.
 * @param {Message} message - The command message.
 * @param {String} query - Used to identify user(s). May be a mention, id, or query. Case INsensitive.
 * @param {Boolean} returnMsg - Return not found
 */
module.exports.getUserID = async (message, query, returnMsg = true) => {
    let id = ''
    const { guild } = message

    //Mention
    if (message.mentions.users.first()) {
        return id = message.mentions.users.first().id
    }

    //ID
    if (guild.members.cache.get(query)) {
        return query
    } 

    //Query
    query = query.toLowerCase()
    const selectedMembers = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(query) || m.displayName.toLowerCase().includes(query))
    if (selectedMembers.size == 0) {
        if(returnMsg) {
            message.channel.send({
                embed: this.embedify(
                    'RED',
                    message.author.username,
                    message.author.displayAvatarURL(),
                    `No members with \`${query.length > 32 ? `${query.substr(0, 32)}...` : query}\` in their user or nick found.`,
                    'Try using a mention or an id.'
                )
            })
        }

        return 'noMemberFound'
    } else if (selectedMembers.size == 1) {
        return selectedMembers.values().next().value.user.id
    } else if (selectedMembers.size > 1 && selectedMembers.size <= 10) {
        let result = []
        selectedMembers.forEach(m => result.push(m.user.id))
        this.memberSelectEmbed(message, result, 10000).then(member => {
            return member.user.id
        })
    } else {
        if(returnMsg) {
            message.channel.send({
                embed: this.embedify(
                    'RED',
                    message.author.username,
                    message.author.displayAvatarURL(),
                    `\`${selectedMembers.size.toString()}\` members found!`,
                    'Try being less broad with your search.'
                )
            })
        }
    
        return 'noMemberFound'
    } 
}

/**
 * Sends an embed to prompt a selection from a list of members.
 * @param {Message} message - The command message.
 * @param {Array} members - An array of members.
 * @param {Number} time - Expiration time for collector
 * @returns {Promise<GuildMember>} Discord member.
 */
module.exports.memberSelectEmbed = async (message, members, time) => {
    return new Promise((resolve, reject) => {
        let list = ''
        members.forEach(u => {
            list += `\`${members.indexOf(u) + 1}\` - <@!${u}>\n`
        })

        message.channel.send({
            embed: this.embedify(
                'BLUE',
                message.author.username,
                message.author.displayAvatarURL(),
                `\`${members.length}\` users found. Please type a specific member's key below:\n\n${list}`,
                'Not the members you\'re looking for? Try a @mention.'
            )
        })

        const filter = m => m.author.id === message.author.id
        const collector = message.channel.createMessageCollector(filter, {
            max: 1,
            time
        })

        let memberFound = false
        collector.on('collect', m => {

            //If the collected message is a number, and the length is within the bounds.
            if (Number.parseInt(m) && Number.parseInt(m) <= members.length) {
                m = Number.parseInt(m)
                memberFound = true
                collector.stop()
                resolve(message.guild.members.cache.get(members[m - 1]))
            }
        })

        collector.on('end', async collected => {
            if (!memberFound) {
                message.channel.send({
                    embed:
                        this.embedify(
                            'RED',
                            message.author.username,
                            message.author.displayAvatarURL(),
                            `:hourglass: Time ran out! ${time / 1000} sec.`
                        )
                })
            }
        })
    })
}

/**
 * Returns a message embed object. 
 * @param {import('discord.js').ColorResolvable} color - Embed Color
 * @param {string} title - Embed title
 * @param {URL} icon_url - Embed picture
 * @param {string} [description] - Embed content.
 * @param {string} [footer] - Embed footer.
 * @returns {MessageEmbed} Message embed.
 */
module.exports.embedify = (color = 'DEFAULT', title = false, icon_url = false, description = false, footer = false) => {
    const embed = new MessageEmbed().setColor(color)
    if (icon_url) embed.setAuthor(title, icon_url)
    else if (title) embed.setTitle(title) 
    if (description) embed.setDescription(description)
    if (footer) embed.setFooter(footer)

    return embed
}

/**
 * @param {Number} min - min value in range
 * @param {Number} max - max value in range
 * @returns {Number} Random value between two inputs
 */
module.exports.intInRange = (min, max) => {
    return Math.ceil((Math.random() * (max - min)) + min)
}

/**
 * Returns a substring from 0 to maxLength if it is longer than maxLength. Appends '...' to the end if cut
 * @param {String} str - the string to cut
 * @param {Number} [maxLength = 32] - the length of the substring 
 */
module.exports.cut = (str, maxLength = 32) => {
    if (maxLength < 0 || maxLength > 2000) throw new Error(`util Error: ${maxLength} is less than 0 or greater than 2000! util.cut: Function`)
    if (!typeof str === 'string') throw new Error(`util Error: ${str} is not a string! util.cut: Function`)
    if (str.length <= maxLength) return str
    return str.substr(0, 32).concat('...')
}

/**
 * Returns whether said income command is successful.
 * @param {object} properties - the command properties
 * @returns {boolean} `isSuccess` — boolean
 */
module.exports.isSuccess = (properties) => {
    const { chance } = properties
    return this.intInRange(0, 100) < chance ? true : false
}

/**
 * @typedef {Object} econInfo
 * @property {Number} wallet
 * @property {Number} treasury
 * @property {Number} networth
 * @property {Number} rank 
 */

/**
 * Gets a user's economy information.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @returns {Promise<econInfo>} wallet, treasury, networth, rank
 */
module.exports.getEconInfo = async (guildID, userID) => {
    let rank = 0, wallet = 0, treasury = 0, networth = 0, found = false
    const balances = await economySchema.find({ guildID }).sort({ networth: -1 })
    if (balances.length) {
        for (let rankIndex = 0; rankIndex < balances.length; rankIndex++) {
            rank = balances[rankIndex].userID === userID ? rankIndex + 1 : rank++
        }

        if (balances[rank - 1]) {
            found = true
            wallet = balances[rank - 1].wallet
            treasury = balances[rank - 1].treasury
            networth = balances[rank - 1].networth
        }
    }

    if(!found) {
        await new economySchema({
            guildID,
            userID,
            wallet, 
            treasury, 
            networth
        }).save()
    }

    return econInfo = {
        wallet, 
        treasury, 
        networth,
        rank
    }
}

/**
 * Changes a user's economy info.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {Number} wallet - The value to be added to the user's wallet.
 * @param {Number} treasury - The value to be added to the user's treasury.
 * @param {Number} networth - The value to be added to the user's networth.
 * @returns {Number} Networth.
 */
module.exports.setEconInfo = async (guildID, userID, wallet, treasury, networth) => {
    await this.getEconInfo(guildID, userID)
    const result = await economySchema.findOneAndUpdate({
        guildID, 
        userID, 
  ***REMOVED*** {
        guildID,
        userID,
        $inc: {
            wallet,
            treasury,
            networth 
        }
  ***REMOVED*** {
        upsert: true,
    })

    return result.networth
}

/**
 * Initializes prefix.
 * @param {Client} client - The bot client.
 */

module.exports.initPrefix = (client) => {
    const initPrefix = async () => {

        //prefix
        const guilds = client.guilds.cache.map(guild => guild.id)
        for (const guild of guilds) {
            const result = await guildSettingSchema.findOne({
                guildID: guild,
            })

            console.log(`Guild: ${guild} \nPrefix: ${client.guilds.cache.get(guild).commandPrefix = result.prefix}`)
        }
    }

    initPrefix()
}

/**
 * Gets prefix.
 * @param {string} guildID - Guild id.
 * @returns {string} prefix 
 */
module.exports.getPrefix = async (guildID) => {
    const result = await guildSettingSchema.findOne({
        guildID,
    })

    let prefix
    if (result?.prefix) {
        prefix = result.prefix
    } else {
        prefix = config.prefix //def
    }

    return prefix
}

/**
 * Sets prefix.
 * @param {CommandoGuild} guild - Guild.
 * @param {string} prefix - New prefix.
 * @returns {string} New prefix
 */
module.exports.setPrefix = async (guild, prefix) => {
    const guildID = guild.id
    if (prefix.toLowerCase() === 'default') {
        guild.commandPrefix = prefix = config.prefix
    } else {
        guild.commandPrefix = prefix
    }

    await guildSettingSchema.findOneAndUpdate({
        guildID
  ***REMOVED*** {
        guildID,
        prefix
  ***REMOVED*** {
        upsert: true,
        new: true
    })

    return prefixCache[guildID] = prefix
}

/**
 * Gets currency symbol.
 * @param {string} guildID - Guild id.
 * @returns {string} Guild currency symbol
 */
module.exports.getCurrencySymbol = async (guildID) => {
    const result = await guildSettingSchema.findOne({
        guildID,
    })

    let currency
    if (result?.currency) {
        currency = result.currency
    } else {
        currency = config.cSymbol //def
    }

    return currency
}

/**
 * Sets currency symbol.
 * @param {string} guildID - Guild id.
 * @param {string} currency - New currency symbol.
 * @returns {string} New currency symbol
 */
module.exports.setCurrencySymbol = async (guildID, currency) => {
    if (currency.toLowerCase() === 'default') {
        currency = config.cSymbol
    }

    await guildSettingSchema.findOneAndUpdate({
        guildID
  ***REMOVED*** {
        currency
  ***REMOVED*** {
        upsert: true,
        new: true
    })

    return currency
}

/**
 * Updates the min and max payout for the specified income command
 * @param {string} guildID - Guild id. 
 * @param {string} command - Income command.
 * @param {object} properties - Command properties.
 */
module.exports.setCommandStats = async (guildID, command, properties = {}) => {
    await incomeSchema.findOneAndUpdate({
        guildID
  ***REMOVED*** {
        $set: {
            [command]: properties
        }
  ***REMOVED*** {
        upsert: true,
        new: true
    }).exec()

    return { command: properties }
}

/**
 * Returns the specified income command's min and max payout values
 * @param {string} guildID - The id of the guild.
 * @param {string} command - The type of income command. 
 * @returns {properties} Properties with config taking preference.
 */
module.exports.getCommandStats = async (guildID, command) => {
    const result = await incomeSchema.findOne({
        guildID,
        [command]: {
            $exists: true
        } 
    })

    let properties = config.income[command]

    for(const property in properties) {
        if(result?.[command]?.[property]) {
            properties[property] = result[command][property]
        }
    }

    return properties
}

/**
 * returns the user's properties of the specified command
 * @param {String} guildID - Guild id.
 * @param {String} userID - User id.
 * @param {String} command - Command name.
 * @returns {uProperties} Properties with config taking preference.
 */
module.exports.getUserCommandStats = async (guildID, userID, command) => {
    let result = await economySchema.findOne({
        guildID,
        userID
    })

    result = result.commands?.[command]
    let properties = config.uCommandStats?.[command]
    for(const property in properties) {
        if(result?.[property])
        properties[property] = result[property]
    }

    return properties
}

/**
 * Updates all specified properties of the command type. 
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {string} type - Income command.
 * @param {object} properties - Command properties
 */
module.exports.setUserCommandStats = async (guildID, userID, command, properties) => {
    const key = `commands.${command}`
    await economySchema.findOneAndUpdate({
        guildID, 
        userID
  ***REMOVED*** {
        $set: {
            [key]: properties
        }
  ***REMOVED*** {
        new: true,
        upsert: true
    })
}

/**
 * Returns whether or not a command's cooldown is exhausted.
 * @param {Message} message - Command message.
 * @param {object} properties - Command properties
 * @param {object} uProperties - User command properties
 * @returns {boolean} 
 */
 module.exports.coolDown = (message, properties, uProperties) => {
    const { cooldown } = properties
    const { timestamp } = uProperties
    const now = new Date().getTime()
    if (now - timestamp < cooldown) {
        message.channel.send({
            embed: this.embedify(
                'GREY',
                message.author.username,
                message.author.avatarURL(),
                `:hourglass: You need to wait ${ms(cooldown - (now - timestamp))} before using this income command again!`,
                `Cooldown: ${ms(cooldown)}`
            )
        })

        return false
    } else {
        return true
    }
}
