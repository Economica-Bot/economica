const { prefix, botAuth } = require('../config.json')
const errorColor = 'RED'

// custom bot authorities, more can be added
const validateAuth = (_auth) => {
     const validAuths = [
          'BOT:OPERATOR', // full permissions (intended use)
          'BOT:CLIENT', // the bot itself
          'BOT:TESTER', // early command testers in the main economica server (intended use)
          'BOT:VIP', // VIPs/premium/etc... (intended use)
     ]

     for (const __auth of _auth) {
          if (!validAuths.includes(__auth)) {
               throw new Error(`Unknown BOT:AUTHORITY node "${__auth}"`)
          }
     }
}

// function used to check if a permission is indeed an actual discord permission key
const validatePermissions = (permissions) => {
     const validPermissions = [
          'CREATE_INSTANT_INVITE',
          'KICK_MEMBERS',
          'BAN_MEMBERS',
          'ADMINISTRATOR',
          'MANAGE_CHANNELS',
          'MANAGE_GUILD',
          'ADD_REACTIONS',
          'VIEW_AUDIT_LOG',
          'PRIORITY_SPEAKER',
          'STREAM',
          'VIEW_CHANNEL',
          'SEND_MESSAGES',
          'SEND_TTS_MESSAGES',
          'MANAGE_MESSAGES',
          'EMBED_LINKS',
          'ATTACH_FILES',
          'READ_MESSAGE_HISTORY',
          'MENTION_EVERYONE',
          'USE_EXTERNAL_EMOJIS',
          'VIEW_GUILD_INSIGHTS',
          'CONNECT',
          'SPEAK',
          'MUTE_MEMBERS',
          'DEAFEN_MEMBERS',
          'MOVE_MEMBERS',
          'USE_VAD',
          'CHANGE_NICKNAME',
          'MANAGE_NICKNAMES',
          'MANAGE_ROLES',
          'MANAGE_WEBHOOKS',
          'MANAGE_EMOJIS',
     ]

     for (const permission of permissions) {
          if (!validPermissions.includes(permission)) {
               throw new Error(`Unknown permission node "${permission}"`)
          }
     }
}

module.exports = (client, commandOptions) => {
     let {
          aliases, // ['ping', 'pong'] aliases and names *required
          expectedArgs = ['\`none\`'], //expectedArgs = '\`none\`', // '<num1> <num2>' arg description +recommended
          exUse = '', // '2 2' args nExample +recommended
          minArgs = 0, // number
          maxArgs = 0, // number
          permissions = [], // ['BAN_MEMBERS', 'KICK_MEMBERS']
          requiredRoles = [], // ['1234567890123', 'some_role_id']
          _auth = null, // ['BOT:OPERATOR', 'BOT:TESTER'] 
          silent = false, // boolean
          callback, // string and/or embed. Parameters: (message, arguments, text) *required
     } = commandOptions

     console.log(`Registering command "${aliases[0]}"`)

     // Ensure the permissions are in an array and are all valid
     if (permissions.length) {
          if (typeof permissions === 'string') {
               permissions = [permissions]
          }

          validatePermissions(permissions)
     }

     if (_auth) {
          if (typeof _auth === 'string') {
               _auth = [_auth]
          }

          validateAuth(_auth)
     }

     // Listen for messages
     client.on('message', (message) => {
          const { member, content, guild } = message

          for (const alias of aliases) {
               const command = `${prefix}${alias.toLowerCase()}`

               if (
                    content.toLowerCase().startsWith(`${command} `) ||
                    content.toLowerCase() === command
               ) {
                    // A command has been ran

                    // check if bot authority is required and if member has that authority
                    if (_auth) {
                         if (!
                              (

                                   // botAuth is an object variable from ./config.json
                                   // operators have access to all commands regardless of _auth
                                   (botAuth.admin_id.includes(member.id)) ||
                                   (_auth.includes('BOT:BOT') && member === client) ||
                                   (_auth.includes('BOT:TESTER') && botAuth.tester_id.includes(member.id)) ||
                                   (_auth.includes('BOT:VIP') && botAuth.vip_id.includes(member.id))
                              )

                         ) {

                              if (silent == false) {
                                   message.channel.send({
                                        embed: {
                                             color: errorColor,
                                             title: '🔏 Missing Authority',
                                             description: `> \`${_auth}\``,
                                             footer: {
                                                  text: 'This command is reserved for testing or\nhas not yet been released'
                                             }
                                        }
                                   })
                              }
                              return
                         }
                    }

                    // Ensure the user has the required roles
                    for (const requiredRole of requiredRoles) {
                         const role = guild.roles.cache.find(
                              (role) => role.id === requiredRole
                         )

                         if (!role || !member.roles.cache.has(role.id)) {
                              if (silent == false) {
                                   message.channel.send({
                                        embed: {
                                             color: errorColor,
                                             title: '🔏 Missing Role',
                                             description: `> <@&${role.id}>`,
                                             footer: {
                                                  text: `You need this role to use the ${prefix}${alias} command.`
                                             }
                                        }
                                   })
                              }
                              return
                         }
                    }


                    // Ensure the user has the required permissions 
                    for (const permission of permissions) {
                         if (!member.hasPermission(permission)) {
                              if (silent == false) {
                                   message.channel.send({
                                        embed: {
                                             color: errorColor,
                                             title: '🔏 Missing Permission',
                                             description: `> \`${permission}\``
                                        }
                                   })
                              }
                              return
                         }
                    }


                    // Split on any number of spaces
                    const arguments = content.split(/[ ]+/)

                    // Remove the command which is the first index
                    arguments.shift()

                    // clean syntax error
                    let _expectedArgs = ''

                    // Ensure we have the correct number of arguments
                    if ( arguments.length < minArgs || (maxArgs !== null && arguments.length > maxArgs)) {
                         if (silent == false) {
                              if ((! expectedArgs) || expectedArgs[0] === 'none' ) {
                                   _expectedArgs = ''
                              } else _expectedArgs = ` ${expectedArgs}`
                              message.channel.send({
                                   embed: {
                                        color: errorColor,
                                        title: '🔏 Incorrect Syntax',
                                        description: `Usage:\n\`${prefix}${alias}${_expectedArgs}\`\n\nExample:\n\`${prefix}${alias} ${exUse}\``
                                   }
                              })
                         }
                         return
                    }

                    // Handle the custom command code
                    callback(message, arguments, arguments.join(' '), client)

                    return
               }
          }
     })
}
// source: https://www.youtube.com/watch?v=lbpUc17InkM&list=PLaxxQQak6D_fxb9_-YsmRwxfw5PH9xALe&index=25