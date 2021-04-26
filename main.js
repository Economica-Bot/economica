const Discord = require('discord.js')
const client = new Discord.Client()

const config = require('./config.json')
const loadCommands = require('./commands/load-cmnds')
const checkMutes = require('./moderation/check-mute')
const mongo = require('./mongo')

client.on('ready', async () => {
     console.log('The client is ready!')

     loadCommands(client)
     checkMutes(client)

     await mongo().then(mongoose => {
          try {
               console.log('connected to mongo')
          } finally {
               mongoose.connection.close()
          }
     })
})

client.login(config.token)