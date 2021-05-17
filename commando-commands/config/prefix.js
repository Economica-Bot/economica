const { Command } = require('discord.js-commando')

const helper = require('../../features/helper')
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
            description: 'Sets the server prefix',
            details: oneLine`
            If no prefix is entered, current server prefix will be shown.
            If the prefix is "default", the server prefix will be set to the bot's default prefix \`.\``,
            format: 'prefix [prefix]',
            examples: [
                'prefix <prefix>',
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

        //outputs the current prefix
        if (!prefix) {
            return helper.infoEmbed(
                message, 
                `The prefix is: \`${message.guild.commandPrefix = await helper.getPrefix(message.guild.id)}\``, 
                `use ${prefix}${this.format} to change prefix.`, 
                this.name
            )        
        }

        //errors if the new prefix is the same
        if (prefix === await helper.getPrefix(message.guild.id)) {
            return helper.errorEmbed(
                message, 
                `\`${prefix}\` is already the server prefix.`, 
                this.name
            )
        }
        
        //sets a new prefix 
        else {
            message.guild.commandPrefix = prefix
            return helper.successEmbed(
                message, 
                `${message.guild}'s command prefix set to \`${await helper.setPrefix(message.guild.id, prefix)}\`.`, 
                `Use ${message.guild.commandPrefix}${this.format} to change the prefix again.`
            )
        }
    }
}
