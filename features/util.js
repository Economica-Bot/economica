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
    if (maxLength < 0 || maxLength > 2000) throw new Error(`Helper Error: ${maxLength} is less than 0 or greater than 2000! helper.cut: Function`)
    if (!typeof str === 'string') throw new Error(`Helper Error: ${str} is not a string! helper.cut: Function`)
    if (str.length <= maxLength) return str
    return str.substr(0, 32).concat('...')
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
    } else await mongo().then(async (mongoose) => {
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
        } catch (err) {
            console.error(err)
        } finally {
            mongoose.connection.close()
        }
    })

    return currencyCache[guildID]
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
 * updates the min and max payout for the specified income command
 * @param {string} _id - the id of the guild
 * @param {string} type - the type of income command (work, beg, crime, etc -- SEE economica/features/schemas/income-sch.js)
 * @param {object} properties - an object of properties for the command
 */
module.exports.setCommandStats = async (_id, type, properties) => {

    // db properties, global default properties, and object in which updated properties will be stored
    const inheritedProperties = await this.getPayout(_id, type, false)
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
module.exports.getPayout = async (_id, type, returnUndefined = true) => {
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