const { CommandoClient, GuildSettingsHelper } = require('discord.js-commando')
const config = require('./config.json')
const path = require('path')
const helper = require('./helper')

const client = new CommandoClient({
     commandPrefix: config.prefix,
     //nonCommandEditable: false,
     owner: config.botAuth.admin_id,
     invite: 'https://discord.gg/R5jvSarddd',

})

client.registry
     .registerDefaults()
     .registerGroups([
          ['config', 'Config & Setup'],
          ['economy', 'Economy'],
          ['utility', 'Utility'],
          ['moderation', 'Moderation']
     ])
     .registerCommandsIn(path.join(__dirname, 'commando-commands'))

client.on('ready', async () => {

     console.log('The client is ready!')
          
     const mongo = require('./mongo')

     await mongo().then(mongoose => {
          try {
               console.log('Connected to Mongo')
          } finally {
               mongoose.connection.close()
          }
     })

     const checkMutes = require('../economica/features/features/check-mute')
     const checkBans = require('../economica/features/features/check-ban')
     checkMutes(client)
     checkBans(client)
})

if (config.useAltToken == true) {
     client.login(config.alt_token)
} else client.login(config.token)