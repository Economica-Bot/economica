const { User, Guild, Message } = require('discord.js')

const { cSymbol, prefix } = require('../config.json')
const mongo = require('./mongo')
const config = require('../config.json')
const client = require('../index') // the client, if needed

const economyBalSchema = require('./schemas/economy-bal-sch')
const guildSettingSchema = require('./schemas/guild-settings-sch')
const incomeSchema = require('./schemas/income-sch')

let prefixCache = {} // cache[guildID]
let balanceCache = {} // cache[guildID][userID]
let currencyCache = {} // cache[guildID]
let incomeCache = {} // cache[guildID][type]
let uCommandStatsCache = {} // cache[guildID][userID][type]

const def = 'default'

/**
 * Returns the member object of the message guild with the specified id.
 * @param {Message} message - The command message.
 * @param {String} id - User id used to retrieve member object.
 */
module.exports.getMemberById = (message, id) => {
    try {
        return message.guild.members.cache.get(id)
    } catch (err) {
        // console.log(err) - enable when testing, else clutters the console (sometimes the error is intended in .bal)
    }
}

/**
 * Returns the user object of the message guild with the specified id.
 * @param {Message} message - The command message.
 * @param {String} id - User id used to retrieve user object.
 */
module.exports.getUserById = (message, id) => {
    try {
        return message.guild.members.cache.get(id).user
    } catch (err) {
        // console.log(err)
    }
}

/**
 * Returns the id of the message guild member whose username or nickname contains the specified query.
 * @param {Message} message - The command message.
 * @param {String} query - Used to identify user(s).
 */
module.exports.getUserIdByMatch = (message, query) => {
    const { guild } = message
    query = query.toLowerCase()

    const selectedMembers = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(query) || m.displayName.toLowerCase().includes(query))
    if (selectedMembers.size == 0) {
        const content = `No members with \`${query.length > 32 ? `${query.substr(0, 32)}...` : query}\` in their user or nick found.\n\nTry mentioning this person or using their ID instead.`
        this.errorEmbed(message, content, 'balance')
        return 'noUserFound'
    } else if (
        selectedMembers.size > 0 &&
        selectedMembers.size < 10
    ) {
        let result = []
        selectedMembers.forEach(m => result.push(m.user.id))
        return result
    } else {
        const content = `\`${selectedMembers.size.toString()}\` members found with those characters!\n\nTry being less broad with your search.`
        this.errorEmbed(message, content, 'balance')
        return 'noUserFound'
    }
}

module.exports.findUser = (message, user) => {
    const { author } = message
    let users = user ?
        message.mentions.users.first() ||
        this.getUserById(message, user) ||
        this.getUserIdByMatch(message, user) :
        author
    return users
}

/**
 * Sends an embed to prompt a selection from a list of members.
 * @param {Message} message - The command message.
 * @param {Array} content - An array of user id's.
 * @param {Number} time - Expiration time for collector
 * @param {String} type - Embed that should be displayed.
 */
module.exports.memberSelectEmbed = (message, users, time, type) => {
    let list = ''
    users.forEach(u => {
        list = `${list}\`${users.indexOf(u) + 1}\` - <@!${u}>\n`
    })
    const description = `\`${users.length}\` users found. Please type a specific user's key below:\n\n${list}`

    message.channel.send({
        embed: {
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL()
          ***REMOVED***
            color: 'BLUE',
            description,
            footer: {
                text: 'Not the users you\'re looking for? Try an @mention.'
            }
        }
    })

    const filter = m => m.author.id === message.author.id
    const collector = message.channel.createMessageCollector(filter, {
        time
    })

    let userFound = false
    collector.on('collect', async m => {

        //If the collected message is a number, and the length is within the bounds.
        if (Number.parseInt(m) && Number.parseInt(m) <= users.length) {
            m = Number.parseInt(m)
            userFound = true
            collector.stop()
            if (type === 'bal') {
                this.displayBal(message, message.guild, message.guild.members.cache.get(users[m - 1]).user)
            }
        }
    })

    collector.on('end', async collected => {
        if (!userFound) {
            await this.deleteMessages(message, collected.size + 2)
            this.errorEmbed(message, `:hourglass: Time ran out! ${time / 1000} sec.`, 'bal')
        }
    })
}

/**
 * Deletes messages.
 * @param {*} message - The command message. 
 * @param {*} msgCount - Amount of messages to delete.
 */
module.exports.deleteMessages = async (message, msgCount) => {
    if (msgCount > 100 || msgCount < 2) {
        return message.say(`Invalid Length: \`${msgCount}\` out of bounds.`)
    }

    await message.channel.bulkDelete(msgCount)
    this.successEmbed(message, `Deleted ${msgCount} messages.`).then((message) => {
        message.delete({
            timeout: 3000
        })
    })
}

/**
 * Sends a success embed.
 * @param {Message} message - The command message.
 * @param {string} description - Embed content.
 * @param {string} [footer] - The embed footer.
 */
module.exports.successEmbed = (message, description, footer = '') => {
    return message.channel.send({
        embed: {
            color: 'GREEN',
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL()
          ***REMOVED***
            description,
            footer: {
                text: footer
            }
        }
    })
}

/**
 * Sends an error embed. 
 * @param {Message} message - The command message.
 * @param {string} description - Embed content.
 * @param {string} [commandName] - The command name. 
 */
module.exports.errorEmbed = (message, description, commandName = '\u200b') => {
    const footer = `\`${message.guild.commandPrefix}help ${commandName}\` • View specific help.`
    if (!commandName) footer = ''
    message.channel.send({
        embed: {
            color: 'RED',
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL(),
          ***REMOVED***
            description,
            footer: {
                text: footer
            }
        }
    })
}

/**
 * Sends an info embed. 
 * @param {Message} message - The command message.
 * @param {string} description - Embed content.
 * @param {string} [footer='default'] - The embed's footer. 
 * @param {string} [commandName] - Command name, used in default footer. 
 */
module.exports.infoEmbed = (message, description, footer = 'default', commandName) => {
    footer = footer === 'default' ? `\`${message.guild.commandPrefix}help ${commandName}\` • View specific help.` : footer
    if (!commandName) footer = ''
    message.channel.send({
        embed: {
            color: 'BLUE',
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL(),
          ***REMOVED***
            description,
            footer: {
                text: footer
            }
        }
    })
}

/**
 * returns a random integer value within the specified range [min, max]. Inclusive
 * @param {number} min - min/start value in range
 * @param {number} max - max/end value in range
 */
module.exports.intInRange = (min, max) => {
    return Math.floor((Math.random() * (max - min + 1)) + min)
}

/**
 * returns a substring from 0 to maxLength if it is longer than maxLength. Appends '...' to the end if cut
 * @param {string} str - the string to cut
 * @param {number} maxLength - the length of the substring (default=32)
 */
module.exports.cut = (str, maxLength = 32) => {
    if (maxLength < 0 || maxLength > 2000) throw new Error(`Helper Error: ${maxLength} is less than 0 or greater than 2000! helper.cut: Function`)
    if (!typeof str === 'string') throw new Error(`Helper Error: ${str} is not a string! helper.cut: Function`)
    if (str.length <= maxLength) return str
    return str.substr(0, 32).concat('...')
}

/**
 * removes objects' fields whose value(s) match any element of v
 * @param {object} obj - the object to be trimmed
 * @param {array} v - the value or array of value(s) that will be filtered from obj
 */
module.exports.trimObj = (obj, v) => {
    if (!v instanceof Array) {
        v = [v]
    }

    for (e in obj) {
        if (v.includes(obj[e])) {
            console.log('trimObj', e)
            delete obj[`${e}`]
        }
    }

    console.log('trimobjobj', obj)

    return obj
}

//
// async:
//

/**
 * Sends a balance embed.
 * @param {Message} message - The command message.
 * @param {Guild} [guild] - The user's guild, default message.guild.
 * @param {User} [user] - A target user, default message.author.
 */
module.exports.displayBal = async (message, guild = message.guild, user = message.author) => {
    const guildID = guild.id
    const userID = user.id

    const balance = await this.getBal(guildID, userID)
    const tempSymbol = await this.getCurrencySymbol(guild.id)

    const cSymbol = tempSymbol ? tempSymbol : cSymbol

    message.channel.send({
        embed: {
            color: 'BLUE',
            author: {
                name: user.username,
                icon_url: user.avatarURL()
          ***REMOVED***
            description: `:trophy: Guild Rank: 0`,
            fields: [
                {
                    name: 'Balance',
                    value: `${cSymbol}${balance}`,
                    inline: true
                }
            ]
        }
    })
}

/**
 * Changes a user's balance.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {number} balance - The value to be added to the user's balance.
 */
module.exports.changeBal = async (guildID, userID, balance) => {
    return await mongo().then(async (mongoose) => {
        try {
            const result = await economyBalSchema.findOneAndUpdate({
                guildID,
                userID,
          ***REMOVED*** {
                guildID,
                userID,
                $inc: {
                    balance
                }
          ***REMOVED*** {
                upsert: true,
                new: true
            })

            // console.log('RESULT BAL:', result.balance)
            balanceCache[`${guildID}`] = { [userID]: result.balance }
            return result.balance
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * Gets a user's balance.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 */
module.exports.getBal = async (guildID, userID) => {
    const cached = balanceCache[`${guildID}`]?.[userID] + 1
    if (cached) {
        return cached - 1
    }

    return await mongo().then(async (mongoose) => {
        try {
            const result = await economyBalSchema.findOne({
                guildID,
                userID,
            })

            let balance = 0
            if (result) {
                balance = result.balance
            } else {
                await new economyBalSchema({
                    guildID,
                    userID,
                    balance
                }).save()
            }

            balanceCache[`${guildID}`] = { [userID]: balance }
            return balance
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * Sets guild prefix.
 * @param {CommandoMessage} guildID - Guild id.
 * @param {String} prefix - New prefix.
 */
module.exports.setPrefix = async (guildID, prefix) => {
    if (prefix.toLowerCase() === 'default') {
        prefix = config.prefix
    }

    prefixCache[`${guildID}`] = prefix ? prefix : config.prefix
    await mongo().then(async (mongoose) => {
        try {
            await guildSettingSchema.findOneAndUpdate({
                _id: guildID
          ***REMOVED*** {
                _id: guildID,
                prefix
          ***REMOVED*** {
                upsert: true
            })
        } finally {
            mongoose.connection.close()
        }
    })

    return prefixCache[guildID]
}

/**
 * Gets guild prefix.
 * @param {string} guildID - Guild id.
 */
module.exports.getPrefix = async (guildID) => {
    const cached = prefixCache[`${guildID}`]
    if (cached) {
        return cached
    } else await mongo().then(async (mongoose) => {
        try {
            const result = await guildSettingSchema.findOne({
                _id: guildID,
            })

            if (result?.prefix) {
                prefixCache[`${guildID}`] = result.prefix
            } else prefixCache[guildID] = config.prefix // if no stored prefix, return the global default
        } finally {
            mongoose.connection.close()
        }
    })

    return prefixCache[guildID]
}

/**
 * Returns guild currency symbol.
 * @param {string} _id - Guild id.
 */
module.exports.getCurrencySymbol = async (_id) => {
    const cached = currencyCache[_id]
    if (cached) {
        return cached
    }

    return await mongo().then(async (mongoose) => {
        try {
            const result = await guildSettingSchema.findOne({
                _id,
            })

            // set currency as the default symbol unless a guild-specific symbol exists in db
            let currency = cSymbol
            if (result && result.currency) {
                currency = result.currency
            }

            currencyCache[_id] = currency
            return currency
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * Sets guild currency symbol.
 * @param {string} _id - Guild id.
 * @param {string} currency - New currency symbol.
 */
module.exports.setCurrencySymbol = async (_id, currency) => {
    return await mongo().then(async (mongoose) => {
        try {
            const result = await guildSettingSchema.findOneAndUpdate({
                _id
          ***REMOVED*** {
                _id,
                currency
          ***REMOVED*** {
                upsert: true,
                new: true
            })

            currencyCache[_id] = result.currency
            return result.currency
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * updates the min and max payout for the specified income command
 * @param {string} _id - the id of the guild
 * @param {string} type - the type of income command (work, beg, crime, etc -- SEE economica/features/schemas/income-sch.js)
 * @param {object} properties - an object of properties for the command
 */
module.exports.setCommandStats = async (_id, type, properties) => {

    // db properties, global default properties, and object in which updated properties will be stored
    const inheritedProperties = await this.getCommandStats(_id, type, false, false)
    const defaultProperties = config.income[type]

    properties = { ...inheritedProperties, ...properties }
    this.trimObj(properties, [undefined, null]) // if a property is undefined or null, do not store it in db

    return await mongo().then(async (mongoose) => {
        try {
            await incomeSchema.findOneAndUpdate({
                _id
          ***REMOVED*** {
                [type]: properties
          ***REMOVED*** {
                upsert: true,
                new: true
            })

            // allows cache to be accessed as incomeCache[_id][type]
            incomeCache[`${_id}`] = { [type]: { ...defaultProperties, ...properties } } // if a property is not in db, store its default value in the cache
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * returns the specified income command's min and max payout values as an object { min, max }
 * @param {string} _id - the id of the guild
 * @param {string} type - the type of income command (work, beg, crime, etc -- SEE economica/features/schemas/income-sch.js) 
 * @param {boolean} returnUndefined - whether to omit undefined fields or return their default value. Default: true (return defaults)
 */
module.exports.getCommandStats = async (_id, type, returnUndefined = true, closeConnection = true) => {
    const cached = incomeCache[`${_id}`]?.[`${type}`]
    if (cached) return cached
    return await mongo().then(async (mongoose) => {
        try {
            const result = await incomeSchema.findOne({
                _id,
            })

            let properties = undefined
            const defaultProperties = config.income[type] // global defaults
            const inheritedProperties = result?.[type] // from db

            if (returnUndefined !== false && inheritedProperties) {
                properties = { ...defaultProperties, ...inheritedProperties } // merge objects with right-left precedence for same-key terms
            }

            properties = properties || inheritedProperties // return object: merged properties or the inherited properties only. Inherited properties will only be returned if returnUndefined is false.
            if (properties) incomeCache[_id] = { [type]: properties } // only cache properties if returnUndefined is true (properties would not be undefined)
            return properties
        } finally {
            if (closeConnection !== false) {
                mongoose.connection.close()
            } 
        }
    })
}

/**
 * returns the user's properties of the specified command
 * @param {string} guildID - the id of the guild
 * @param {string} userID - the id of the user
 * @param {string} type - the command name
 */
module.exports.getUserCommandStats = async (guildID, userID, type, returnUndefined = true, closeConnection = true) => {
    const cached = uCommandStatsCache[`${guildID}`]?.[userID]?.[type]
    if (cached) return cached
    return await mongo().then(async (mongoose) => {
        try {
            const result = await economyBalSchema.findOne({
                guildID,
                userID
            })

            let properties = undefined
            const defaultProperties = config.uCommandStats[type]
            const inheritedProperties = result?.[type]
            
            if (returnUndefined !== false && inheritedProperties) {
                properties = { ...defaultProperties, ...inheritedProperties }
            }

            properties = properties || inheritedProperties
            if (properties) uCommandStatsCache[guildID] = { [userID]: { [type]: properties } }
            return properties
        } finally {
            mongoose.connection.close()
        }
    })
}
/**
 * updates all specified properties of the command type. Does not alter values that were not given.
 * @param {string} guildID - the id of the guild
 * @param {string} userID - the id of the user
 * @param {array} properties - the object of properties for the corresponding object. Set as 'default' for default values. refer to the `commands` field of features/schemas/economy-bal-sch.js and its subfields for contents. All are optional.
 */
module.exports.editUserCommandProperties = async (guildID, userID, type, properties) => {
    const inheritedProperties = uCommandStatsCache[guildID][userID][type] || await this.getUserCommandStats(guildID, userID, type) // ?db properties
    const defaultProperties = config.uCommandStats[type] // config.json global default properties
    let tempProperties = {} // instantiated filtered properties object
    // filter property origins: param (input) properties else db properties else default properties
    for (const property in properties) {
        tempProperties[property] = properties[property] ||
            inheritedProperties && inheritedProperties[property] ? inheritedProperties[property] : defaultProperties[property] ||
            defaultProperties[property] // final catch
    }
    properties = tempProperties

    return await mongo().then(async (mongoose) => {
        try {
            const result = await economyBalSchema.findOneAndUpdate({
                guildID,
                userID
          ***REMOVED*** {
                commands: {
                    [type]: properties
                }
            })
        } finally {
            mongoose.connection.close()
        }
    })
}