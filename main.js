const Discord = require('discord.js')
const client = new Discord.Client
const { token, prefix, owner_id } = require('./config.json')

const command = require('./command')
const embed = new Discord.MessageEmbed()
const reactMessage = require('./reaction-message')

const default_blue = 0x0099ff


client.on('ready', () => {
     console.log('Connected as ', client.user.tag)

     command(client, ['ping', 'latency', 'ms'], (message) => {
          const user = message.author
          message.channel.send({
               embed: {
                    color: 'DEFAULT',
                    description: `:ping_pong: **${Date.now() - message.createdTimestamp}**ms`,
                    footer: {
                         text: user.tag,
                         icon_url: user.avatarURL()
                    }
               }
          })
     })

     command(client, ['servers', 'serverlist', 'sl'], (message) => {
          const user = message.author
          let guildNames = '', guildMemberCounts = '', guildCount = 0, totalMembers = 0
          client.guilds.cache.forEach((guild) => (
               guildNames = `${guildNames}${guild.name}\n`,
               guildMemberCounts = `${guildMemberCounts}${guild.memberCount}\n`,
               guildCount = guildCount + 1,
               totalMembers = totalMembers + guild.memberCount
          ))
          message.channel.send({
               embed: {
                    color: default_blue,
                    title: '<:discord_file:821611827237748759> Bot Guilds',
                    fields: [
                         {
                              name: 'List of servers with Economica & their membercounts.',
                              value: '\u200b',
                         },
                         {
                              name: 'Name',
                              value: guildNames,
                              inline: true,
                         },
                         {
                              name: 'Members',
                              value: guildMemberCounts,
                              inline: true,
                         },
                         {
                              name: '\u200b',
                              value: `Guilds: ${guildCount}\nMembers: ${totalMembers}`,
                              inline: false
                         }
                    ],
                    footer: {
                         text: user.tag,
                         icon_url: user.avatarURL()
                    }
               }
          })
     })
     command(client, ['cc', 'clearchannel', 'purgeall', 'purge all'], (message) => {
          if (message.member.hasPermission('MANAGE_MESSAGES')) {
               message.channel.messages.fetch().then((results) => {
                    message.channel.bulkDelete(results)
               })
          }
     })
     command(client, ['av', 'avatar', 'profile'], (message) => {
          const user = message.mentions.members.first() || message.author
          message.channel.send({
               embed: {
                    title: '<:discord_file:821611827237748759> Avatar',
                    color: default_blue,
                    image: {
                         url: user.avatarURL(),
                    },
                    footer: {
                         text: user.tag,
                         icon_url: user.avatarURL()
                    }
               }
          })
     })
     command(client, ['si', 'serverinfo', 'server'], async (message) => {
          const user = message.author
          const { guild } = message
          const { ownerID, name, memberCount, channels, roles, id, emojis} = guild
          let textChannels = channels.cache.filter(channel => channel.type === 'text').size, voiceChannels = channels.cache.filter(channel => channel.type === 'voice').size, categories = channels.cache.filter(channel => channel.type === 'category').size, roleCount = roles.cache.size, emojiCount = emojis.cache.size

          message.channel.send({
               embed: {
                    color: default_blue,
                    title: `<:discord_metrics:821614062056112178> Server Info`,
                    thumbnail: {
                         url: guild.iconURL(),
                    },
                    fields: [
                         {
                              name: '\u200b',
                              value: 'Name:\nOwner:\nID:\nMembers:\n\nCategory Channels:\nText Channels:\nVoice Channels:\nTotal:\n\nRoles:\nEmojis:',
                              inline: true,
                         },
                         {
                              name: '\u200b',
                              value: `${name}\n<@!${ownerID}>\n${id}\n${memberCount}\n\n${categories}\n${textChannels}\n${voiceChannels}\n${categories+textChannels+voiceChannels}\n\n${roleCount}\n${emojiCount}`,
                              inline: true,
                         },
                    ],
                    footer: {
                         text: user.tag,
                         icon_url: user.avatarURL()
                    }
               }
          })
     })
     client.user.setPresence(
          {
               activity: {
                    name: 'over the economy',
                    type: 'WATCHING'
               }
          }
     )
})

client.login(token)