const { User, Guild, Message, MessageEmbed, GuildMember } = require('discord.js')
const { Client, CommandoMessage } = require('discord.js-commando')

const config = require('../config.json')
const mongo = require('./mongo')

const economyBalSchema = require('./schemas/economy-bal-sch')
const guildSettingSchema = require('./schemas/guild-settings-sch')
const incomeSchema = require('./schemas/income-sch')

let prefixCache = {} // cache[guildID]
let balanceCache = {} // cache[guildID][userID]
let currencyCache = {} // cache[guildID]
let incomeCache = {} // cache[guildID][type]
let uCommandStatsCache = {} // cache[guildID][userID][type]

/**
 * Returns the id of the message guild member.
 * @param {Message} message - The command message.
 * @param {String} query - Used to identify user(s). May be a mention, id, or query. Case INsensitive.
 */
module.exports.getUserID = async (message, query) => {
    return new Promise((resolve, reject) => {
        let id = ''
        const { guild } = message
        
        //Mention
        if(message.mentions.users.first()) {
            resolve(id = message.mentions.users.first().id)
            return
        }

        //ID 
        if(parseInt(query)) {
            if(guild.members.cache.get(query)) {
                resolve(query)
                return
            } else {
                resolve('noIDMemberFound')
                return
            }
        } 

        //Query
        query = query.toLowerCase()
        const selectedMembers = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(query) || m.displayName.toLowerCase().includes(query))
        if (selectedMembers.size == 0) {
            message.channel.send({
                embed: this.embedify(
                    'RED', 
                    message.author.username, 
                    message.author.displayAvatarURL(), 
                    `No members with \`${query.length > 32 ? `${query.substr(0, 32)}...` : query}\` in their user or nick found.`,
                    'Try using a mention or an id.'
                )
            })
            resolve('noMemberFound')
            return
        } else if(selectedMembers.size == 1) { 
            resolve(selectedMembers.values().next().value.user.id)
        } else if ( selectedMembers.size > 1 && selectedMembers.size <= 10 ) {
            let result = []
            selectedMembers.forEach(m => result.push(m.user.id))
            this.memberSelectEmbed(message, result, 10000).then(member => {
                resolve(member.user.id)
                return
            })
        } else {
            message.channel.send({
                embed: this.embedify(
                    'RED', 
                    message.author.username, 
                    message.author.displayAvatarURL(), 
                    `\`${selectedMembers.size.toString()}\` members found!`,
                    'Try being less broad with your search.'
                )
            })
            resolve('noMemberFound')
            return
        }
    })
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
 * @param {Array} members - An array of members.
 * @param {Number} time - Expiration time for collector
 * @returns {Promise<GuildMember>} Discord member.
 */
module.exports.memberSelectEmbed = async (message, members, time) => {
    return new Promise((resolve, reject) => {
        let list = ''
        members.forEach(u => {
            list = `${list}\`${members.indexOf(u) + 1}\` - <@!${u}>\n`
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
                message.channel.send({ embed: 
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
 * Deletes messages.
 * @param {Message} message - The command message. 
 * @param {Number} msgCount - Amount of messages to delete.
 */
module.exports.deleteMessages = async (message, msgCount) => {
    if (msgCount > 100 || msgCount < 2) {
        return message.channel.send(`Invalid Length: \`${msgCount}\` out of bounds.`).then((message) => {
            setTimeout(() => message.delete(), 4000)
        })
    }

    await message.channel.bulkDelete(msgCount).catch((err) => {
        message.channel.send({embed: this.embedify('RED', message.author, message.author.displayAvatarURL(), `${err}`) }).then((message) => {
            setTimeout(() => message.delete(), 4000)
        })
    })

    message.channel.send({ embed: this.embedify('GREEN', message.author.username, message.author.displayAvatarURL(), `Deleted ${msgCount} messages.`) }).then((message) => {
        setTimeout(() => message.delete(), 4000)
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
module.exports.embedify = (color, title, icon_url, description = '', footer = '') => {
    const embed = new MessageEmbed()
        .setColor(color)
        .setAuthor(title, icon_url)
    
    if (description.length > 0) embed.setDescription(description)
    if (footer.length > 0) embed.setFooter(footer)

    return embed
}

/**
 * returns a random integer value within the specified range [min, max]. Inclusive
 * @param {number} min - min value in range
 * @param {number} max - max value in range
 */
module.exports.intInRange = (min, max) => {
    return Math.ceil((Math.random() * (max - min)) + min)
}

/**
 * returns a substring from 0 to maxLength if it is longer than maxLength. Appends '...' to the end if cut
 * @param {string} str - the string to cut
 * @param {number} [maxLength = 32] - the length of the substring 
 */
module.exports.cut = (str, maxLength = 32) => {
    if (maxLength < 0 || maxLength > 2000) throw new Error(`util Error: ${maxLength} is less than 0 or greater than 2000! util.cut: Function`)
    if (!typeof str === 'string') throw new Error(`util Error: ${str} is not a string! util.cut: Function`)
    if (str.length <= maxLength) return str
    return str.substr(0, 32).concat('...')
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
 * @typedef {Object} balRank
 * @property {Number} balance
 * @property {Number} rank 
 */

/**
 * Gets a user's balance and rank.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @returns {Promise<balRank>} balance, rank
 */
 module.exports.getBal = async (guildID, userID) => {
    return await mongo().then(async (mongoose) => {
        try {
            const balances = await economyBalSchema.find({ guildID }).sort({ balance: -1 })
            let rank = 0 
            let balance = 0
            if (balances.length) {
                for(let rankIndex = 0; rankIndex < balances.length; rankIndex++) {
                    if(balances[rankIndex].userID === userID) {
                        rank = rankIndex + 1
                        break
                    }
                }
                if(balances[rank - 1]) {
                    balance = balances[rank - 1].balance
                } else {
                    await new economyBalSchema({
                        guildID,
                        userID,
                        balance
                    }).save()
                    rank = balances.length + 1
                }
            } 
            return balanceRank = {
                balance, 
                rank
            }
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * Changes a user's balance.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {Number} balance - The value to be added to the user's balance.
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

            balanceCache[`${guildID}`] = { [userID]: result.balance }
            return result.balance
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * Initializes prefix.
 * @param {Client} client - The bot client.
 */

module.exports.initPrefix = (client) => {
    const initPrefix = async () => {

        //prefix
        const guilds = client.guilds.cache.map(guild => guild.id)
        for(const guild of guilds) {
            await mongo().then(async (mongoose) => {
                try {
                    const result = await guildSettingSchema.findOne({
                        _id: guild,
                    })
                    
                    if (result?.prefix) {
                        prefixCache[guild] = result.prefix
                    } else prefixCache[guild] = config.prefix // if no stored prefix, return the global default
                } finally {
                    mongoose.connection.close()
                }
            })

            console.log(`Guild: ${guild} \nPrefix: ${client.guilds.cache.get(guild).commandPrefix = prefixCache[guild]}`)
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
    const cached = prefixCache[guildID]
    if (cached) {
        return cached
    } else await mongo().then(async (mongoose) => {
        try {
            const result = await guildSettingSchema.findOne({
                _id: guildID,
            })

            let prefix
            if (result?.prefix) {
                prefix = result.prefix
            } else {
                prefix = config.prefix //def
            } 

            prefixCache[guildID] = prefix
        } catch (err) {
            console.error(err)
        } finally {
            mongoose.connection.close()
        }
    })

    return prefixCache[guildID]
}

/**
 * Sets prefix.
 * @param {CommandoMessage} message - Command message.
 * @param {string} prefix - New prefix.
 * @returns {string} New prefix
 */
module.exports.setPrefix = async (message, prefix) => {
    const guildID = message.guild.id
    if (prefix.toLowerCase() === 'default') {
        message.guild.commandPrefix = prefix = config.prefix
    } else {
        message.guild.commandPrefix = prefix
    }

    await mongo().then(async (mongoose) => {
        try {
            await guildSettingSchema.findOneAndUpdate({
                _id: guildID
          ***REMOVED*** {
                _id: guildID,
                prefix
          ***REMOVED*** {
                upsert: true,
                new: true
            })
        } finally {
            mongoose.connection.close()
        }
    })

    return prefixCache[guildID] = prefix 
}

/**
 * Gets currency symbol.
 * @param {string} guildID - Guild id.
 * @returns {string} Guild currency symbol
 */
module.exports.getCurrencySymbol = async (guildID) => {
    const cached = currencyCache[guildID]
    if (cached) {
        return cached
    } else return await mongo().then(async (mongoose) => {
        try {
            const result = await guildSettingSchema.findOne({
                _id: guildID,
            })

            let currency 
            if (result?.currency) {
                currency = result.currency
            } else {
                currency = config.cSymbol //def
            }

            currencyCache[guildID] = currency
            return currencyCache[guildID]
        } catch (err) {
            console.error(err)
        } finally {
            mongoose.connection.close()
        }
    })
}

/**
 * Sets currency symbol.
 * @param {string} _id - Guild id.
 * @param {string} currency - New currency symbol.
 * @returns {string} New currency symbol
 */
module.exports.setCurrencySymbol = async (guildID, currency) => {
    if(currency.toLowerCase() === 'default') {
        currency = config.cSymbol
    }

    await mongo().then(async (mongoose) => {
        try {
            await guildSettingSchema.findOneAndUpdate({
                _id: guildID
          ***REMOVED*** {
                _id: guildID,
                currency
          ***REMOVED*** {
                upsert: true,
                new: true
            })
        } finally {
            mongoose.connection.close()
        }
    })

    return currencyCache[guildID] = currency
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
            delete obj[`${e}`]
        }
    }

    return obj
}

/**
 * updates the min and max payout for the specified income command
 * @param {string} _id - the id of the guild
 * @param {string} type - the type of income command (work, beg, crime, etc -- SEE economica/features/schemas/income-sch.js)
 * @param {object} properties - an object of properties for the command
 */
module.exports.setCommandStats = async (_id, type, properties) => {

    // db properties, global default properties, and object in which updated properties will be stored
    const inheritedProperties = await this.getCommandStats(_id, type, false)
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
 * @typedef {Object} payout
 * @param {Number} min
 * @param {Number} max
 */

/**
 * Returns the specified income command's min and max payout values
 * @param {string} _id - the id of the guild
 * @param {string} type - the type of income command (work, beg, crime, etc -- SEE economica/features/schemas/income-sch.js) 
 * @param {boolean} returnUndefined - whether to omit undefined fields or return their default value. Default: true (return defaults)
 * @returns {payout} minimum, maximum | merged properties or the inherited properties only. Inherited properties will only be returned if returnUndefined is false.
 */
module.exports.getCommandStats = async (_id, type, returnUndefined = true) => {
    const cached = incomeCache[`${_id}`]?.[`${type}`]
    if (cached) return cached
    return await mongo().then(async (mongoose) => {
        try {
            const result = await incomeSchema.findOne({
                _id,
            })

            let properties
            const defaultProperties = config.income[type] // global defaults
            const inheritedProperties = result?.[type] // from db
            if (returnUndefined && inheritedProperties) {
                properties = { ...defaultProperties, ...inheritedProperties } // merge objects with right-left precedence for same-key terms
            }

            properties = properties || inheritedProperties 
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
 * @param {boolean} returnUndefined - whether to omit undefined fields or return their default value. Default: true (return defaults)
 * @param {boolean} closeConnection - whether to close the mongo connection or not. Default: true (close connection)
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
            const defaultProperties = config.uCommandStats[type];
            const inheritedProperties = result?.[type];
            
            if (returnUndefined !== false) {
                properties = { ...defaultProperties, ...inheritedProperties }
            }

            properties = properties || inheritedProperties
            if (properties) uCommandStatsCache[guildID] = { [userID]: { [type]: properties } }
            return properties
        } finally {
            if (closeConnection !== false) {
                mongoose.connection.close()
            }
        }
    })
}

/**
 * updates all specified properties of the command type. Does not alter values that were not given.
 * @param {string} guildID - the id of the guild
 * @param {string} userID - the id of the user
 * @param {string} type - the specific command
 * @param {array} properties - the object of properties for the corresponding object. Set as 'default' for default values. refer to the `commands` field of features/schemas/economy-bal-sch.js and its subfields for contents. All are optional.
 */
 module.exports.setUserCommandStats = async (guildID, userID, type, properties) => {
    const inheritedProperties = await this.getUserCommandStats(guildID, userID, type, false, false)
    const defaultProperties = config.income[type]
    properties = { ...inheritedProperties, ...properties }
    this.trimObj(properties, [undefined, null]) // trim object for db

    return await mongo().then(async (mongoose) => {
        try {
            await economyBalSchema.findOneAndUpdate({
                guildID,
                userID
          ***REMOVED*** {
                commands: {
                    [type]: properties
                }
          ***REMOVED*** {
                upsert: true,
                new: true
            })

            uCommandStatsCache[guildID] = { [userID]: { [type]: { ...defaultProperties, ...properties } } } // do not trim cached object
        } finally {
            mongoose.connection.close()
        }
    })
}