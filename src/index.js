const Discord = require('discord.js')

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

global.slashTypes = {
    subcommand: 1,
    subcommandGroup: 2,
    string: 3,
    integer: 4,
    boolean: 5,
    user: 6,
    channel: 7,
    role: 8,
    mentionable: 9,
    number: 10
}

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

client.ws.on('INTERACTION_CREATE', async interaction => {
    if(interaction.type !== 2) {
        return
    }

    try {
        const command = client.commands.get(interaction.data.name) 
        const guild = await client.guilds.cache.get(interaction.guild_id)
        const author = await guild.members.cache.get(interaction.member.user.id)
        const args = interaction.data.options
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

        command.run(interaction, guild, author, args)
    } catch (err) {
        console.error(err)
        client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
            type: 4, 
            data: {
                content: `${err.message}`,
                flags: 64
            }
        }})
    }   
})

client.login(process.env.ECON_TOKEN)

client.registerCommandFile = (commandDirectory, commandFile) => {
    const command = require(`./commands/${commandDirectory}/${commandFile}`)
    client.api.applications(process.env.APPLICATION_ID).guilds(process.env.GUILD_ID).commands.post({data: {
        name: command.name,
        description: command.description,
        options: command.options
    }})

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