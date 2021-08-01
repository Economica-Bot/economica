const Discord = require('discord.js')

const fs = require('fs')
const util = require('./util/util')
const mongo = require('./util/mongo/mongo')

require('dotenv').config()

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

client.on('ready', async () => {
    console.log(`${client.user.tag} Ready`)

    const commandDirectories = fs.readdirSync('./commands')
    for(const commandDirectory of commandDirectories) {
        const commandFiles = fs.readdirSync(`./commands/${commandDirectory}/`).filter(file => file.endsWith('js'))
        for(const commandFile of commandFiles) {
            registerCommandFile(commandDirectory, commandFile)
        }
    }

    await mongo().then(async () => {
        console.log('Connected to DB')
    })

    const checkMutes = require('./util/features/check-mute')
    checkMutes(client)
})

client.ws.on('INTERACTION_CREATE', async interaction => {
    try {
        const command = client.commands.get(interaction.data.name) 
                    || client.commands.find(cmd => cmd.aliases.some(u => u === interaction.data.name))
        const guild = await client.guilds.cache.get(interaction.guild_id)
        const author = await guild.members.cache.get(interaction.member.user.id)
        const args = interaction.data.options
        const missingPermissions = command.permissions ? hasPermissions(author, command.permissions) : null
        if(missingPermissions) {
            const embed = util.embedify(
                'RED', 
                author.user.username, 
                author.user.displayAvatarURL(), 
                `You are missing the ${missingPermissions.substring(0, missingPermissions.length - 2)} permission(s) to run this command.`
            )
            
            say(interaction, null, embed, 64)
            return
        }
        command.run(interaction, guild, author, args)
    } catch (err) {
        console.error(err)
        client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
            type: 4, 
            data: {
                content: `${err.message}`
            }
        }})
    }   
})

client.login(process.env.ECON_TOKEN)

const registerCommandFile = (commandDirectory, commandFile) => {
    const command = require(`./commands/${commandDirectory}/${commandFile}`)
    client.api.applications(process.env.APPLICATION_ID).guilds(process.env.GUILD_ID).commands.post({data: {
        name: command.name,
        description: command.description,
        options: command.options
    }})

    if(command.aliases) {
        for(const alias of command.aliases) {
            client.api.applications(process.env.APPLICATION_ID).guilds(process.env.GUILD_ID).commands.post({data: {
                name: alias,
                description: command.description,
                options: command.options
            }})
        }
    }

    client.commands.set(command.name, command)
    console.log(`${command.name} command registered`)
}

const hasPermissions = (author, permissions) => {
    let missingPermissions = ''
    for(const permission of permissions) {
        if(!author.permissions.has(permission)) {
            missingPermissions += `\`${permission}\`, `     
        }
    }

    return missingPermissions.length ? missingPermissions : null
}

const say = async (interaction, content = null, embed = null, flags = null) => {
    await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
            content,
            embeds: [ embed ], 
            flags
      ***REMOVED***
    }})
}