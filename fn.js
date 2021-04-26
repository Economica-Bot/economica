/* Global variables */
const { cSymbol, prefix } = require('./config.json')

/* Functions (Helpers) */

// GET functions
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
               selectedMembers.size < 10
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

// CREATE functions
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