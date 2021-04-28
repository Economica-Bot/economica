const Discord = require('discord.js')
const client = new Discord.Client({ fetchAllMembers: true })

client.setMaxListeners(0)

const config = require('./config.json')

const loadCommands = require('./commands/load-cmnds')
const checkMutes = require('./moderation/check-mute')
const checkBans = require('./moderation/check-ban')
const mongo = require('./mongo')

client.on('ready', async () => {
     console.log('The client is ready!')

     loadCommands(client)

     await mongo().then(mongoose => {
          try {
               console.log('Connected to Mongo')
          } finally {
               mongoose.connection.close()
          }
     })

     checkMutes(client)
     checkBans(client)
})

if (config.useAltToken == true) {
     client.login(config.alt_token)
} else client.login(config.token)