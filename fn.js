/* Global variables */
const { cSymbol, prefix } = require('./config.json')

/* Private variables */
const prefixCache = {} // syntax: String (guildID) : String (prefix)

const mongo = require('./mongo')
const guildSettingsSchema = require('./schemas/guildsettings-sch')

/* Functions (Helpers) */

// -- SET functions -- //

module.exports.setPrefix = async (guildID, prefix) => {

     const cached = prefixCache[`${guildID}`]
     if(prefix == cached) return

     return await mongo().then(async (mongoose) => {
          try {
               const result = await guildSettingsSchema.findOneAndUpdate({
                    _id: guildID
               }, {
                    _id: guildID,
                    prefix
               }, {
                    upsert: true,
                    new: true
               })
               if(!result) {
                    await new guildSettingsSchema({
                         _id: guildID,
                         prefix
                    }).save()
               }
          } finally {
               mongoose.connection.close()
          }
     })
}

// -- GET functions -- //

// returns the user object of the message guild member with the specified id
module.exports.getMemberUserById = (message, id, condition) => {
     if (condition != undefined) {
          const member = message.guild.members.cache.get(id);
          if (
               member != undefined
          ) {
               return member.user;
          }
     } else return;
}

// returns the id of the message guild member whose username or nickname contains the specified string
module.exports.getMemberUserIdByMatch = (message, string, condition) => {
     if (condition) {
          const { guild } = message;
          string = string.toLowerCase()

          const selectedMembers = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(string) || m.displayName.toLowerCase().includes(string))
          if (selectedMembers.size == 0) {
               const content = `No members with \`${string.substr(0,32)}\` in their user or nick found.\nTry mentioning this person or using their ID instead.`
               message.channel.send({ embed: this.displayEmbedError(message.author, content, 'balance')})
               return 'endProcess';
          } else if (
               selectedMembers.size > 0 &&
               selectedMembers.size <= 10
          ) {
               let result = []; selectedMembers.forEach(m => result.push(m.user.id))
               return result;
          } else {
               const content = `Woah, \`${selectedMembers.size.toString()}\` members found with those characters!\nTry being less broad with your search.`
               message.channel.send({ embed: this.displayEmbedError(message.author, content, 'balance')})
               return 'endProcess'
          };

     }
}

module.exports.getPrefix = async (guildID) => {
     const cached = prefixCache[`${guildID}`]
     if (cached) {
          console.log(cached)
          return cached
     }
     return await mongo().then(async (mongoose) => {
          try {

               const result = await guildSettingsSchema.findOne({
                    _id: guildID
               })

               let guildprefix = prefix
               if (result) {
                    guildprefix = result.prefix
               }

               prefixCache[`${guildID}`] = guildprefix
               
               return guildprefix
          } finally {
               mongoose.connection.close()
          }
     })
}

// -- CREATE functions -- //

// returns a message collector in message.channel that accepts one number greater than zero and less than the specified max
// note this does not activate the collector event, it only constructs the collector. the event must be activated manually: collector.on('collect', m => { ... })
module.exports.createNumberCollector = (message, numMax, time) => {
     const filter = m => {
          return (
               (parseInt(m.content) > 0 && parseInt(m.content) < numMax) &&
               m.author.id === message.author.id
          )
     }
     return message.channel.createMessageCollector(filter, { time, max: 1 })
}

// DISPLAY functions

// retrieves message guild member balance and sends an embed in message.channel
module.exports.displayBal = async (message, guild = message.guild, user = message.author, economy = require('./economy')) => {
     const guildID = guild.id
     const userID = user.id

     const balance = await economy.getBal(guildID, userID)

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

// returns error embed with specified author, content, and optional commandName for help reference
module.exports.displayEmbedError = (author, content, commandName = '\u200b') => {
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

module.exports.displayPrefix = async (guild) => {
     const guildID = guild.id

     // const guildprefix = await economy. // ...
}