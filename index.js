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
    disableEveryone: false,
    fetchAllMembers: true,
    intents: allIntents
})

module.exports = client

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['moderation', 'Moderation'],
        ['economy', 'Economy'],
        ['market', 'Market'],
        ['market (archaic)', 'Archaic Market - Cannot Use'],
        ['shop', 'Shop'],
        ['income', 'Income'],
        ['util', 'Utility'],
        ['config', 'Config & Setup']
    ])
    .registerCommandsIn(
        path.join(__dirname, 'commands'), 
    )
    .registerCommandsIn(
        path.join(__dirname, 'commands/economy')
    )

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
    const { initPrefix } = require('./features/util')
    checkMutes(client)
    initPrefix(client)
})

client.login(config.useAltToken ? config.alt_token : config.token)