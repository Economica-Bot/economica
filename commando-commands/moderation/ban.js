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
                    'ban @Bob',
                    'ban @Bob Spamming'
               ],
               clientPermissions: [
                    'BAN_MEMBERS'
               ],
               userPermissions: [
                    'BAN_MEMBERS'
               ],
               argsSingleQuotes: false,
               argsType: 'multiple',
               argsCount: 2,
               args: [
                    {
                         key: 'target',
                         prompt: 'please @mention the member you wish to ban',
                         type: 'member'
                  ***REMOVED***
                    {
                         key: 'reason',
                         prompt: 'please provide a reason for this ban',
                         type: 'string',
                         infinite: true,
                         default: 'NONE'
                    }
               ]
          })
     }

     async run(message, { target, reason }) {
          const { guild, author: staff } = message
          if(target.bannable) {
               await mongo().then( async (mongoose) => {
                    try{
                         await new banSchema({
                              userID: target.id,
                              guildID: guild.id,
                              reason: `${reason}`,
                              staffID: staff.id,
                              staffTag: staff.tag,
                              current: true,
                              expired: false,
                         }).save()
                    } finally {
                         mongoose.connection.close()
                    }
               }) 

               const targetMember = guild.members.cache.get(target.id)
               targetMember.ban({
                    reason: reason
               })
               message.say(`Banned user ${target} for \`${reason}\``)
          }
     }
     
}