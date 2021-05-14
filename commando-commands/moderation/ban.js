const { Command } = require('discord.js-commando')
const mongo = require('../../mongo')
const banSchema = require('../../schemas/ban-sch')

module.exports = class BanCommand extends Command {
     constructor(client) {
          super(client, {
               name: 'ban',
               aliases: ['permaban'],
               group: 'moderation',
               guildOnly: true,
               memberName: 'ban',
               description: 'Bans a user',
               details: 'This command will ban a specified user and record details about the ban.',
               examples: [
                    'ban <@user>',
                    'ban @Bob',
                    'ban @Bob Spamming'
               ],
               clientPermissions: [
                    'BAN_MEMBERS'
               ],
               userPermissions: [
                    'BAN_MEMBERS'
               ],
               argsType: 'multiple',
               argsCount: 2,
               args: [
                    {
                         key: 'member',
                         prompt: 'please @mention the member you wish to ban',
                         type: 'member'
                    },
                    {
                         key: 'reason',
                         prompt: 'please provide a reason for this ban',
                         type: 'string',
                         default: 'No reason provided'
                    }
               ]
          })
     }

     async run(message, { member, reason }) {
          const { guild, author: staff } = message
          if(member.bannable) {
               let result = ''
               try {
                    await member.send(`You have been banned from **${guild} for \`${reason}\``)
               } catch {
                    result += `Could not dm ${member.user.tag}.`
               }
               member.ban({
                    reason: reason
               })
               message.say(`${result}\nBanned user ${member} for \`${reason}\``)

               await mongo().then( async (mongoose) => {
                    try{
                         await new banSchema({
                              userID: member.id,
                              guildID: guild.id,
                              reason,
                              staffID: staff.id,
                              staffTag: staff.tag,
                              current: true,
                              expired: false,
                         }).save()
                         //console.log(`Ban Schema created: ${member.user.tag} in server ${guild} for "${reason}"`)
                    } finally {
                         mongoose.connection.close()
                    }
               }) 
          } else {
               message.say(`${member.user.tag} could not be banned.`)
          }
     }
}