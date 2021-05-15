const { cSymbol, prefix } = require('./config.json')
const mongo = require('./mongo')
const path = require('path')
const fs = require('fs')
const config = require('./config.json')

const economyBalSchema = require('./schemas/economy-bal-sch')
const guildSettingSchema = require('./schemas/guild-settings-sch')
const { User, Guild, Message } = require('discord.js')

const prefixCache = {} // guildID: [prefix]
const balanceCache = {} // guildID-UserID: [balance]
const currencyCache = {} // guildID: [:emoji:]

const def = 'default'

/**
 * returns the user object of the message guild member with the specified id
 * @param {Message} message - parent object of guild, typically message
 * @param {string} id - member id
 */
module.exports.getMemberUserById = (message, id) => {
     const member = message.guild.members.cache.get(id);
     if (
          member != undefined
     ) {
          return member.user;
     }
}

/**
 * returns the id of the message guild member whose username or nickname contains the specified string
 * @param {Message} message - object that contains guild property
 * @param {string} string - string to validate for username match
 */
module.exports.getMemberUserIdByMatch = (message, string) => {
     const { guild } = message;
     string = string.toLowerCase()

     const selectedMembers = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(string) || m.displayName.toLowerCase().includes(string))
     if (selectedMembers.size == 0) {
          const content = `No members with \`${string.substr(0, 32)}\` in their user or nick found.\nTry mentioning this person or using their ID instead.`
          message.channel.send({ embed: this.createErrorEmbed(message.author, content, 'balance') })
          return 'endProcess';
     } else if (
          selectedMembers.size > 0 &&
          selectedMembers.size <= 10
     ) {
          let result = []; selectedMembers.forEach(m => result.push(m.user.id)) // @Adrastopoulos please keep this as returning id. Make a separate function getMemberUserTagById if desired.
          return result;
     } else {
          const content = `Woah, \`${selectedMembers.size.toString()}\` members found with those characters!\nTry being less broad with your search.`
          message.channel.send({ embed: this.createErrorEmbed(message.author, content, 'balance') })
          return 'endProcess'
     }
}

/**
 * Sends an embed to prompt a selection from a list of members
 * @param {Message} message - message object from caller command
 * @param {array} content - array pf user id's
 */
module.exports.createMemberEmbedSelection = (message, content) => {
     let list = ''
     content.forEach(u => {
          list = `${list}\`${content.indexOf(u) + 1}\` - <@!${u}>\n`
     })
     const description = `\`${content.length}\` users found. Please type a specific user's key below:\n\n${list}`

     message.channel.send({ embed: {
          author: {
               name: message.author.tag,
               icon_url: message.author.avatarURL()
          },
          color: 'BLUE',
          description,
          footer: {
               text: 'Type the number corresponding to the user you wish to select.\nNot the user\'s you\'re looking for? Try an @mention.'
          }
     }})
}

/**
 * returns a message collector in message.channel that accepts one number greater than zero and less than the specified max
 * @param {Message} message - collector parent object, typically message (where the collector listens)
 * @param {number} numMax - total number of choices
 * @param {number} time - time in ms until collector expires
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
 * returns error embed with specified author, content, and optional commandName for help reference
 * @param {User} author - embed author user
 * @param {string} content - embed description
 * @param {string} commandName - name of command where error occured
 */
module.exports.createErrorEmbed = (author, content, commandName = '\u200b') => {
     return {
          color: 'RED',
          author: {
               name: author.tag,
               icon_url: author.avatarURL(),
          },
          description: content,
          footer: {
               text: `${prefix}help ${commandName} | view specific help`
          }
     }
}

/**
 * creates an error embed object
 * @param {User} author - author of the embed
 * @param {string} description - description of the embed
 * @param {string} commandName - name of the command optional
 */
module.exports.displayEmbedError = (author, description, commandName = '\u200b') => {
     if (commandName === def) commandName = '\u200b'
     return {
          color: 'RED',
          author: {
               name: author.tag,
               icon_url: author.avatarURL(),
          },
          description,
          footer: {
               text: `${prefix}help ${commandName} | view specific help`
          }
     }
}
/**
 * creates an info embed object
 * @param {User} author - author of the embed
 * @param {string} description - description of the embed
 * @param {string} footer - footer text of the embed optional
 * @param {string} commandName - name of the command optional
 */
module.exports.displayEmbedInfo = (author, description, footer = def, commandName = def) => {
     if (!commandName || commandName === def) commandName = '\u200b'
     footer = footer === def ? `${prefix}help ${commandName} | view specific help` : footer
     return {
          color: 'BLUE',
          author: {
               name: author.tag,
               icon_url: author.avatarURL()
          },
          description,
          footer: {
               text: footer
          }
     }
}


// -- database -- //

/**
 * sends an embed detailing user's balance
 * @param {Message} message - channel in which to display balance info
 * @param {Guild} guild - user's guild, default message.guild
 * @param {User} user - the target user, default message.author
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
               },
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
 * increase a user's balance value
 * @param {string} guildID - id of the guild
 * @param {string} userID - id of the user
 * @param {number} balance - value to increase balance by
 */
module.exports.addBal = async (guildID, userID, balance) => {
     return await mongo().then(async (mongoose) => {
          try {

               const result = await economyBalSchema.findOneAndUpdate({
                    guildID,
                    userID,
               }, {
                    guildID,
                    userID,
                    $inc: {
                         balance
                    }
               }, {
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
 * get a user's balance value
 * @param {string} guildID - id of the guild
 * @param {string} userID - id of the user
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
 * Set the prefix of a guild by id
 * @param {CommandoMessage} guildID - the id of the guild
 * @param {String} prefix - the new prefix
 */
module.exports.setPrefix = async (guildID, prefix) => {
     if(prefix.toLowerCase() === 'default') {
          prefix = config.prefix
     }
     prefixCache[`${guildID}`] = prefix ? prefix : config.prefix
     await mongo().then(async (mongoose) => {
          try {
               await guildSettingSchema.findOneAndUpdate({
                    _id: guildID
               }, {
                    _id: guildID,
                    prefix
               }, {
                    upsert: true
               })
          } finally {
               mongoose.connection.close()
          }
     })
     return prefixCache[`${guildID}`]
}

/**
 * get the prefix of a guild by id
 * @param {string} guildID - the id of the guild
 */
module.exports.getPrefix = async (guildID) => {
     const cached = prefixCache[`${guildID}`]
     if(cached !== undefined) {
          return cached
     } else await mongo().then(async (mongoose) => {
          try {
               console.log('Calling mongodb')
               const result = await guildSettingSchema.findOne({
                    _id: guildID,
               })
               if(result) {
                    prefixCache[`${guildID}`] = result.prefix
               }
          } finally {
               mongoose.connection.close()
          }
     })
     return prefixCache[guildID]
}

/**
 * returns the currency symbol for the guild or the default currency symbol if none is present.
 * @param {string} _id - the id of the guild
 */
module.exports.getCurrencySymbol = async (_id) => {
     const cached = currencyCache[_id]
     if (cached) return cached

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
 * finds and updates guild currency symbol, or creates a new mongo doc if none exists
 * @param {string} _id - the id of the guild
 * @param {string} currency - the new currency emoji/symbol for the server
 */
module.exports.setCurrencySymbol = async (_id, currency) => {
     return await mongo().then(async (mongoose) => {
          try {
               const result = await guildSettingSchema.findOneAndUpdate({
                    _id
               }, {
                    _id,
                    currency
               }, {
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