const Discord = require('discord.js')

const { ApplicationCommandOptionType } = require('discord-api-types/v9')

const fs = require('fs')
const util = require('./util/util')
const mongo = require('./util/mongo/mongo')

require('dotenv').config()
const config = require('./config.json')

const client = new Discord.Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES', 
        'GUILD_BANS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
        'DIRECT_MESSAGES',
    ]
})

client.commands = new Discord.Collection()

global.client = client
global.Discord = Discord
global.util = util
global.mongo = mongo
global.ApplicationCommandOptionType = ApplicationCommandOptionType

client.on('ready', async () => {
    console.log(`${client.user.tag} Ready`)

    const commandDirectories = fs.readdirSync('./commands')
    for(const commandDirectory of commandDirectories) {
        const commandFiles = fs.readdirSync(`./commands/${commandDirectory}/`).filter(file => file.endsWith('js'))
        for(const commandFile of commandFiles) {
            client.registerCommandFile(commandDirectory, commandFile)
        }
    }

    await mongo().then(async () => {
        console.log('Connected to DB')
    })

    const checkMutes = require('./util/features/check-mute')
    checkMutes(client)
})

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) {
        return
    }
    
    const command = client.commands.get(interaction.commandName) 
    const author = interaction.member
    const guild = author.guild
    const options = interaction.options
    const missingPermissions = client.hasPermissions(author, command) 
    if(missingPermissions) {
        const embed = util.embedify(
            'RED', 
            author.user.username, 
            author.user.displayAvatarURL(), 
            `You are missing the ${missingPermissions.join(', ')} permission(s) to run this command.`
        )

        client.say(interaction, null, embed, 64)
        return
    }

    command.run(interaction, guild, author, options) 
})

client.login(process.env.ECON_ALPHA_TOKEN)

client.registerCommandFile = async (commandDirectory, commandFile) => {
    const command = require(`./commands/${commandDirectory}/${commandFile}`)
    client.guilds.cache.get(process.env.GUILD_ID).commands.create(command)
    client.commands.set(command.name, command)
    console.log(`${command.name} command registered`)
}

client.hasPermissions = (author, command) => {
    let missingPermissions = []
    if(command.permissions) {
        for(const permission of command.permissions) {
            if(!author.permissions.has(permission)) {
                missingPermissions.push(`\`${permission}\``)     
            }
        }
    }

    if(command.ownerOnly && !config.botAuth.admin_id.includes(author.user.id)) {
        missingPermissions.push(`\`OWNER\``) 
    }

    return missingPermissions.length ? missingPermissions : null
}

client.say = async (interaction, content = null, embed = null, flags = null) => {
    await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
            content,
            embeds: [ embed ], 
            flags
      ***REMOVED***
    }})
}