// const Discord = require('discord.js')
// const client = new Discord.Client({ fetchAllMembers: true })
// client.setMaxListeners(0)

const Commando = require('discord.js-commando')
const config = require('./config.json')
const path = require('path')

const client = new Commando.CommandoClient({
     commandPrefix: config.prefix,
     nonCommandEditable: false,
     owner: config.botAuth.admin_id,
     invite: 'https://discord.gg/R5jvSarddd'
})

client.registry
     .registerGroups([
          ['config', 'Config & Setup'],
          ['economy', 'Economy'],
          ['utility', 'Utility'],
          ['moderation', 'Moderation']
     ])
     .registerDefaults()
     .registerCommandsIn(path.join(__dirname, 'commando-cmds'))

// const loadCommands = require('./commands/load-cmnds')
// const checkMutes = require('./moderation/check-mute')
// const checkBans = require('./moderation/check-ban')
const mongo = require('./mongo')

client.on('ready', async () => {
     console.log('The client is ready!')

     // loadCommands(client)

     await mongo().then(mongoose => {
          try {
               console.log('Connected to Mongo')
          } finally {
               mongoose.connection.close()
          }
     })

     // checkMutes(client)
     // checkBans(client)
})

if (config.useAltToken == true) {
     client.login(config.alt_token)
} else client.login(config.token)