const ms = require('ms');

const config = require('../config.json')

const economySchema = require('../util/mongo/schemas/economy-sch')
const guildSettingSchema = require('../util/mongo/schemas/guild-settings-sch')
const incomeSchema = require('../util/mongo/schemas/income-sch')
const infractionSchema = require('../util/mongo/schemas/infraction-sch')
const inventorySchema = require('../util/mongo/schemas/inventory-sch')
const marketItemSchema = require('../util/mongo/schemas/market-item-sch')

/**
 * Returns a message embed object. 
 * @param {Discord.ColorResolvable} color - Embed Color
 * @param {string} title - Embed title
 * @param {URL} icon_url - Embed picture
 * @param {string} [description] - Embed content.
 * @param {string} [footer] - Embed footer.
 * @returns {MessageEmbed} Message embed.
 */
module.exports.embedify = (color = 'DEFAULT', title = false, icon_url = false, description = false, footer = false) => {
    const embed = new Discord.MessageEmbed().setColor(color)
    if (icon_url) embed.setAuthor(title, icon_url)
    else if (title) embed.setTitle(title) 
    if (description) embed.setDescription(description)
    if (footer) embed.setFooter(footer)

    return embed
}

/**
 * Gets a user's economy information.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @returns {Promise<econInfo>} wallet, treasury, networth, rank
 */
module.exports.getEconInfo = async (guildID, userID) => {
    let rank = 0, wallet = 0, treasury = 0, networth = 0, found = false
    const balances = await economySchema.find({ guildID }).sort({ networth: -1 })
    if (balances.length) {
        for (let rankIndex = 0; rankIndex < balances.length; rankIndex++) {
            rank = balances[rankIndex].userID === userID ? rankIndex + 1 : rank++
        }

        if (balances[rank - 1]) {
            found = true
            wallet = balances[rank - 1].wallet
            treasury = balances[rank - 1].treasury
            networth = balances[rank - 1].networth
        }
    }

    if(!found) {
        await new economySchema({
            guildID,
            userID,
            wallet, 
            treasury, 
            networth
        }).save()
    }

    return econInfo = {
        wallet, 
        treasury, 
        networth,
        rank
    }
}

/**
 * Changes a user's economy info.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {Number} wallet - The value to be added to the user's wallet.
 * @param {Number} treasury - The value to be added to the user's treasury.
 * @param {Number} networth - The value to be added to the user's networth.
 * @returns {Number} Networth.
 */
 module.exports.setEconInfo = async (guildID, userID, wallet, treasury, networth) => {
    await this.getEconInfo(guildID, userID)
    const result = await economySchema.findOneAndUpdate({
        guildID, 
        userID, 
  ***REMOVED*** {
        guildID,
        userID,
        $inc: {
            wallet,
            treasury,
            networth 
        }
  ***REMOVED*** {
        upsert: true,
    })

    return result.networth
}

/**
 * Gets currency symbol.
 * @param {string} guildID - Guild id.
 * @returns {string} Guild currency symbol
 */
 module.exports.getCurrencySymbol = async (guildID) => {
    const result = await guildSettingSchema.findOne({
        guildID,
    })

    let currency
    if (result?.currency) {
        currency = result.currency
    } else {
        currency = config.cSymbol //def
    }

    return currency
}

/**
 * Sets currency symbol.
 * @param {string} guildID - Guild id.
 * @param {string} currency - New currency symbol.
 * @returns {string} New currency symbol
 */
 module.exports.setCurrencySymbol = async (guildID, currency) => {
    if (currency.toLowerCase() === 'default') {
        currency = config.cSymbol
    }

    await guildSettingSchema.findOneAndUpdate({
        guildID
  ***REMOVED*** {
        currency
  ***REMOVED*** {
        upsert: true,
        new: true
    })

    return currency
}

/**
 * Updates the min and max payout for the specified income command
 * @param {string} guildID - Guild id. 
 * @param {string} command - Income command.
 * @param {object} properties - Command properties.
 */
 module.exports.setCommandStats = async (guildID, command, properties = {}) => {
    await incomeSchema.findOneAndUpdate({
        guildID
  ***REMOVED*** {
        $set: {
            [command]: properties
        }
  ***REMOVED*** {
        upsert: true,
        new: true
    }).exec()

    return { command: properties }
}

/**
 * Returns the specified income command's min and max payout values
 * @param {string} guildID - The id of the guild.
 * @param {string} command - The type of income command. 
 * @returns {properties} Properties with config taking preference.
 */
module.exports.getCommandStats = async (guildID, command) => {
    const result = await incomeSchema.findOne({
        guildID,
        [command]: {
            $exists: true
        } 
    })

    let properties = config.income[command]

    for(const property in properties) {
        if(result?.[command]?.[property]) {
            properties[property] = result[command][property]
        }
    }

    return properties
}

/**
 * returns the user's properties of the specified command
 * @param {String} guildID - Guild id.
 * @param {String} userID - User id.
 * @param {String} command - Command name.
 * @returns {uProperties} Properties with config taking preference.
 */
module.exports.getUserCommandStats = async (guildID, userID, command) => {
    let result = await economySchema.findOne({
        guildID,
        userID
    })

    result = result.commands?.[command]
    let properties = config.uCommandStats?.[command]
    for(const property in properties) {
        if(result?.[property])
        properties[property] = result[property]
    }

    return properties
}

/**
 * Updates all specified properties of the command type. 
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {string} type - Income command.
 * @param {object} properties - Command properties
 */
module.exports.setUserCommandStats = async (guildID, userID, command, properties) => {
    const key = `commands.${command}`
    await economySchema.findOneAndUpdate({
        guildID, 
        userID
  ***REMOVED*** {
        $set: {
            [key]: properties
        }
  ***REMOVED*** {
        new: true,
        upsert: true
    })
}

/**
 * @param {Number} min - min value in range
 * @param {Number} max - max value in range
 * @returns {Number} Random value between two inputs
 */
 module.exports.intInRange = (min, max) => {
    return Math.ceil((Math.random() * (max - min)) + min)
}

/**
 * Returns whether or not a command's cooldown is exhausted.
 * @param {Message} interaction - Slash command interaction.
 * @param {object} properties - Command properties
 * @param {object} uProperties - User command properties
 * @returns {boolean} 
 */
 module.exports.coolDown = async (interaction, properties, uProperties) => {
    const { cooldown } = properties
    const { timestamp } = uProperties
    const now = new Date().getTime()
    if (now - timestamp < cooldown) {
        const embed = this.embedify(
            'GREY',
            interaction.member.user.username,
            '',// interaction.member.user.displayAvatarURL(),
            `:hourglass: You need to wait ${ms(cooldown - (now - timestamp))} before using this income command again!`,
            `Cooldown: ${ms(cooldown)}`
        )

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ embed ]
            }
        }})

        return false
    } else {
        return true
    }
}

/**
 * Returns whether said income command is successful.
 * @param {object} properties - the command properties
 * @returns {boolean} `isSuccess` — boolean
 */
 module.exports.isSuccess = (properties) => {
    const { chance } = properties
    return this.intInRange(0, 100) < chance ? true : false
}