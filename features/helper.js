const { User, Guild, Message } = require('discord.js')

const { cSymbol, prefix } = require('../config.json')
const mongo = require('./mongo')
const config = require('../config.json')

const economyBalSchema = require('./schemas/economy-bal-sch')
const guildSettingSchema = require('./schemas/guild-settings-sch')

const prefixCache = {} // guildID: [prefix]
const balanceCache = {} // guildID-UserID: [balance]
const currencyCache = {} // guildID: [:emoji:]

const def = 'default'

/**
 * Returns the member object of the message guild with the specified id.
 * @param {Message} message - The command message.
 * @param {string} id - User id used to retrieve member object.
 */
module.exports.getMemberByUserId = (message, id) => {
    const member = message.guild.members.cache.get(id)
    if (
        member != undefined
    ) {
        return member
    }
}

/**
 * Returns the id of the message guild member whose username or nickname contains the specified query.
 * @param {Message} message - The command message.
 * @param {string} string - Used to identify user(s).
 */
module.exports.getUserIdByMatch = (message, query) => {
    const { guild } = message
    query = query.toLowerCase()

    const selectedMembers = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(query) || m.displayName.toLowerCase().includes(query))
    if (selectedMembers.size == 0) {
        const content = `No members with \`${query.substr(0, 32)}\` in their user or nick found.\n\nTry mentioning this person or using their ID instead.`
        this.errorEmbed(message, content, 'balance')
        return 'noUserFound'
    } else if (
        selectedMembers.size > 0 &&
        selectedMembers.size <= 10
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

/**
 * Sends an embed to prompt a selection from a list of members.
 * @param {Message} message - The command message.
 * @param {array} content - An array of user id's.
 */
module.exports.memberSelectEmbed = (message, content) => {
    let list = ''
    content.forEach(u => {
        list = `${list}\`${content.indexOf(u) + 1}\` - <@!${u}>\n`
    })
    const description = `\`${content.length}\` users found. Please type a specific user's key below:\n\n${list}`

    message.channel.send({
        embed: {
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL()
          ***REMOVED***
            color: 'BLUE',
            description,
            footer: {
                text: 'Type the number corresponding to the user you wish to select.\nNot the user\'s you\'re looking for? Try an @mention.'
            }
        }
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
 * Returns a message collector in message.channel that accepts one number greater than zero and less than the specified max.
 * @param {Message} message - The command message.
 * @param {number} numMax - The total number of choices.
 * @param {number} time - The time in ms until collector expires.
 */
 module.exports.createNumberCollector = (message, numMax, time) => {
    const filter = m => {
        return (
            (parseInt(m.content) > 0 && parseInt(m.content) <= numMax) &&
            m.author.id === message.author.id
        )
    }
    return message.channel.createMessageCollector(filter, { time, max: 1 })
}

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
    if (cached !== undefined) {
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
 * Sets guild prefix.
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