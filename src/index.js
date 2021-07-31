const Discord = require('discord.js')
const fs = require('fs')
const util = require('./util/util')

const { alt_token, application_id, guild_id } = require('./config.json')

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

client.on('ready', async () => {
    console.log(`${client.user.tag} Ready`)

    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
    for(const commandFile of commandFiles) {
        const command = require(`./commands/${commandFile}`)
        client.api.applications(application_id).guilds(guild_id).commands.post({data: {
            name: command.name,
            description: command.description,
            options: command.options
        }})

        client.commands.set(command.name, command)
        console.log(`${command.name} command registered`)
    }
})

client.ws.on('INTERACTION_CREATE', async interaction => {
    try {
        client.commands.get(interaction.data.name).run(interaction)
    } catch (err) {
        console.error(err)
        client.api.interactions(interaction.id, interation.token).callback.post({ data: {
            type: 4, 
            data: {
                content: 'Error'
            }
        }})
    }   
})

client.login(alt_token)