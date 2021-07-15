const { Command } = require('discord.js-commando')
const util = require('../../features/util')
const { oneLine } = require('common-tags')

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            aliases: [
                'p',
            ],
            guildOnly: true,
            memberName: 'prefix',
            group: 'config',
            description: 'Returns or updates Economica\'s prefix',
            details: oneLine`If no prefix is entered, Economica\'s prefix will be shown.
                            If the prefix is "default", the server prefix will be set to the default prefix.
                            Max length is 8 characters.`,
            format: '[prefix]',
            examples: [
                'prefix .',
                'prefix'
            ],
            argsCount: 1,
            args: [
                {
                    key: 'prefix',
                    prompt: 'Specify the new server prefix.',
                    type: 'string',
                    max: 8,
                    default: '',
              ***REMOVED***
            ],
        })
    }

    async run(message, { prefix }) {
        const { guild } = message
        let color, description, footer
        const currPrefix = await util.getPrefix(message.guild.id)

        //outputs the current prefix
        if (!prefix) {
            color = 'BLURPLE',
                description = `The command prefix is: \`${currPrefix}\``,
                footer = `use ${message.guild.commandPrefix}${prefix}${this.format} to change prefix`
        } else {
            let econManagerRole = guild.roles.cache.find(role => {
                return role.name.toLowerCase() === 'economy manager'
            })

            if (!econManagerRole) {
                message.reply('Please create an \`Economy Manager\` role!')
                return
            }

            if (!message.member.roles.cache.has(econManagerRole.id)) {
                message.channel.send({
                    embed: util.embedify(
                        'RED',
                        message.author.username,
                        message.author.displayAvatarURL(),
                        `You must have the <@&${econManagerRole.id}> role.`
                    )
                })

                return
            }
        }

        //errors if the new prefix is the same
        if (prefix === currPrefix) {
            color = 'RED',
                description = `\`${prefix}\` is already the command prefix.`
        }

        //sets a new prefix 
        else {
            color = 'GREEN'
            description = `Command prefix set to \`${await util.setPrefix(message, prefix)}\``
        }

        message.channel.send({
            embed: util.embedify(
                color,
                this.client.user.username,
                this.client.user.displayAvatarURL(),
                description,
                footer
            )
        })
    }
}
