const config = require('../config.json')
const economySchema = require('../util/mongo/schemas/economy-sch')
const guildSettingSchema = require('../util/mongo/schemas/guild-settings-sch')

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