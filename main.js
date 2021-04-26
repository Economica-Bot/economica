const path = require('path')
const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client({ fetchAllMembers: true })

const config = require('./config.json')
const mongo = require('./mongo')

client.on('ready', async () => {
     console.log('The client is ready!')

     const baseFile = 'cmd-handler.js'
     const commandBase = require(`./commands/${baseFile}`)

     const readCommands = (dir) => {
          const files = fs.readdirSync(path.join(__dirname, dir))
          for (const file of files) {
               const stat = fs.lstatSync(path.join(__dirname, dir, file))
               if (stat.isDirectory()) {
                    readCommands(path.join(dir, file))
               } else if (file !== baseFile) {
                    const option = require(path.join(__dirname, dir, file))
                    commandBase(client, option)
               }
          }
     }

     readCommands('commands')

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