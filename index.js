const { CommandoClient } = require('discord.js-commando')
const { Intents } = require('discord.js')

const config = require('./config.json')
const mongo = require('./features/mongo')
const path = require('path')

const allIntents = Intents.ALL

const client = new CommandoClient({
    commandPrefix: config.prefix,
    nonCommandEditable: false,
    owner: config.botAuth.admin_id,
    invite: 'https://discord.gg/R5jvSarddd',
    unknownCommandResponse: false,
    fetchAllMembers: true,
    intents: allIntents
})

module.exports = client

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['moderation', 'Moderation'],
        ['economy', 'Economy'],
        ['util', 'Utility'],
        ['config', 'Config & Setup']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', async () => {

    console.log('The client is ready!')

    await mongo().then(mongoose => {
        try {
            console.log('Connected to Mongo')
        } finally {
            mongoose.connection.close()
        }
    })

    const checkMutes = require('./features/features/check-mute')
    const checkBans = require('./features/features/check-ban')
    checkMutes(client)
    checkBans(client)
})

if (config.useAltToken == true) {
    client.login(config.alt_token)
} else client.login(config.token)