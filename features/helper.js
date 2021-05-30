const { User, Guild, Message } = require('discord.js')

const { cSymbol, prefix } = require('../config.json')
const mongo = require('./mongo')
const config = require('../config.json')

const economyBalSchema = require('./schemas/economy-bal-sch')
const guildSettingSchema = require('./schemas/guild-settings-sch')
const incomeSchema = require('./schemas/income-sch')

let prefixCache = {} // guildID: [prefix]
let balanceCache = {} // guildID-UserID: [balance]
let currencyCache = {} // guildID: [:emoji:]
let incomeCache = {} // guildID-type: { min, max } 

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
 * @param {String} string - Used to identify user(s).
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
        const content = `Woah, \`${selectedMembers.size.toString()}\` members found with those characters!\n\nTry being less broad with your search.`
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
                text: 'Type the number corresponding to the user you wish to select.\nNot the users you\'re looking for? Try an @mention.'
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
            balanceCache[`${guildID}-${userID}`] = result.balance
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
    const cached = balanceCache[`${guildID}-${userID}`] + 1
    if (cached) {
        return cached - 1
    }

    return await mongo().then(async (mongoose) => {
        try {
            const result = await economyBalSchema.findOne({
                guildID,
                userID,
            })

            // console.log('Result: ', result)
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

            balanceCache[`${guildID}-${userID}`] = balance
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

            if (result) {
                prefixCache[`${guildID}`] = result.prefix
            }
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
 * @param {number} min - min payout
 * @param {number} max - max payout
 */
module.exports.setIncome = async (_id, type, min, max) => {
    return await mongo().then(async (mongoose) => {
        try {
            const result = await incomeSchema.findOneAndUpdate({
                _id
          ***REMOVED*** {
                [type]: {
                    min,
                    max
                }
          ***REMOVED*** {
                upsert: true,
                new: true
            })

            incomeCache[`${_id}-${type}`] = { min: result[type].min, max: result[type].max }
            // console.log(incomeCache)
            return { min: result[type].min, max: result[type].max }
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * returns the specified income command's min and max payout values as an object { min, max }
 * @param {string} _id - the id of the guild
 * @param {string} type - the type of income command (work, beg, crime, etc -- SEE economica/features/schemas/income-sch.js) 
 */
module.exports.getIncomeStats = async (_id, type) => {
    return await mongo().then(async (mongoose) => {
        try {
            const result = await incomeSchema.findOne({
                _id,
            })

            const _default = config.income[type]
            let ref = _default

            // default properties
            let properties = {
                min: ref.min,
                max: ref.max,
                cooldown: ref.cooldown,
                chance: ref.chance,
                minFine: ref.minFine,
                maxFine: ref.maxFine
            }

            // if there is a document in db, update properties to those fields
            if (result) {
                const _new = result[type]
                ref = _new
                properties = {
                    min: ref.min,
                    max: ref.max,
                    cooldown: ref.cooldown,
                    chance: ref.chance,
                    minFine: ref.minFine,
                    maxFine: ref.maxFine
                }
            }

            // console.log(properties)
            return properties
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * returns the user's properties of the specified command
 * @param {string} guildID - the id of the guild
 * @param {string} userID - the id of the user
 * @param {string} type - the command name
 */
module.exports.getUserCommandStats = (guildID, userID, type) => {
    return await mongo().then(async (mongoose) => {
        try {
            const result = await economyBalSchema.findOne({
                guildID,
                userID
            })

            const properties = (result) ? result.commands[type] : config.uCommandStats[type]

            console.log(result)
            console.log(properties)

            return properties
        } finally {
            mongoose.connection.close()
        }
    })
}