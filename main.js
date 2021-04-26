const Discord = require('discord.js')
const client = new Discord.Client({ fetchAllMembers: true })

const config = require('./config.json')
const loadCommands = require('./commands/load-cmnds')
const mongo = require('./mongo')

client.on('ready', async () => {
     console.log('The client is ready!')

     loadCommands(client)

     await mongo().then(mongoose => {
          try {
               console.log('connected to mongo')
          } finally {
               mongoose.connection.close()
          }
     })
})

if (config.useAltToken == true) {
     client.login(config.alt_token)
} else client.login(config.token)