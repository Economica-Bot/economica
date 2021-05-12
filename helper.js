const { cSymbol, prefix } = require('./config.json')
const mongo = require('./mongo')
const path = require('path')
const fs = require('fs')

const economyBalSchema = require('./schemas/economy-bal-sch')
const prefixSchema = require('./schemas/prefix-sch')
const { User, Guild, Message } = require('discord.js')

const prefixCache = {} // guildID: [prefix]
const balanceCache = {} // guildID-UserID: [balance]

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
 * @param {Message} message - parent object of guild, typically message
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
          let result = []; selectedMembers.forEach(m => result.push(m.user.id))
          return result;
     } else {
          const content = `Woah, \`${selectedMembers.size.toString()}\` members found with those characters!\nTry being less broad with your search.`
          message.channel.send({ embed: this.createErrorEmbed(message.author, content, 'balance') })
          return 'endProcess'
     }
}

/**
 * Set the prefix of a guild by id
 * @param {String} guildID - the id of the guild
 * @param {String} prefix - the new prefix
 */
 module.exports.setPrefix = async (guildID, prefix) => {
     prefixCache[`${guildID}`] = prefix

     await mongo().then(async (mongoose) => {
          try {
               await prefixSchema.findOneAndUpdate({
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
     return prefixCache[`${guildID}`]
}

/**
 * get the prefix of a guild by id
 * @param {string} guildID - the id of the guild
 */
module.exports.getPrefix = async (guildID) => {
     const cached = prefixCache[`${guildID}`]
     if (cached) {
          return cached
     }
     else await mongo().then(async (mongoose) => {
          try {
               const result = await prefixSchema.findOne({
                    guildID,
               })

               let guildPrefix = prefix
               if (result) {
                    guildPrefix = result.prefix
               }

               prefixCache[`${guildID}`] = guildPrefix

               return guildPrefix
          } finally {
               mongoose.connection.close()

          }
     })
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
        ***REMOVED***
          description: content,
          footer: {
               text: `${prefix}help ${commandName} | view specific help`
          }
     }
}

/**
 * 
 * @param {User} author - author of the embed
 * @param {string} content - description of the embed
 * @param {string} commandName - name of the command optional
 */
module.exports.displayEmbedError = (author, content, commandName = '\u200b') => {
     return {
          color: 'RED',
          author: {
               name: author.tag,
               icon_url: author.avatarURL(),
        ***REMOVED***
          description: content,
          footer: {
               text: `${prefix}help ${commandName} | view specific help`
          }
     }
}

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