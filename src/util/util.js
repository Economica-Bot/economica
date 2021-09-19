const ms = require('ms');
const config = require('../config.json');

require('module-alias/register');
const economySchema = require('@schemas/economy-sch');
const guildSettingSchema = require('@schemas/guild-settings-sch');
const incomeSchema = require('@schemas/income-sch');
const infractionSchema = require('@schemas/infraction-sch');
const inventorySchema = require('@schemas/inventory-sch');
const loanSchema = require('@schemas/loan-sch');
const marketItemSchema = require('@schemas/market-item-sch');
const transactionSchema = require('@schemas/transaction-sch');
const shopItemSchema = require('@schemas/shop-item-sch');

/**
 * Returns a message embed object.
 * @param {Discord.ColorResolvable} color - Embed Color
 * @param {string} title - Embed title
 * @param {URL} icon_url - Embed picture
 * @param {string} [description] - Embed content.
 * @param {string} [footer] - Embed footer.
 * @returns {MessageEmbed} Message embed.
 */
module.exports.embedify = (
  color = 'DEFAULT',
  title = null,
  icon_url = null,
  description = null,
  footer = null
) => {
  const embed = new Discord.MessageEmbed().setColor(color);
  if (icon_url) embed.setAuthor(title, icon_url);
  else if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (footer) embed.setFooter(footer);

  return embed;
};

module.exports.error = (description, title = 'Input Error') => {
  return {
    embeds: [{
      color: 'RED',
      title,
      description
    }], ephemeral: true
  };
};

/**
 * Gets a user's economy information.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @returns {Promise<econInfo>} wallet, treasury, total, rank
 */
module.exports.getEconInfo = async (guildID, userID) => {
  let rank = 0,
    wallet = 0,
    treasury = 0,
    total = 0,
    found = false;
  const balances = await economySchema.find({ guildID }).sort({ total: -1 });
  if (balances.length) {
    for (let rankIndex = 0; rankIndex < balances.length; rankIndex++) {
      rank = balances[rankIndex].userID === userID ? rankIndex + 1 : rank++;
    }

    if (balances[rank - 1]) {
      found = true;
      wallet = balances[rank - 1].wallet;
      treasury = balances[rank - 1].treasury;
      total = balances[rank - 1].total;
    }
  }

  if (!found) {
    await new economySchema({
      guildID,
      userID,
      wallet,
      treasury,
      total,
    }).save();
  }

  return (econInfo = {
    wallet,
    treasury,
    total,
    rank,
  });
};

/**
 * Changes a user's economy info.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {string} transaction_type - The transaction type.
 * @param {string} memo - The transaction dispatcher.
 * @param {Number} wallet - The value to be added to the user's wallet.
 * @param {Number} treasury - The value to be added to the user's treasury.
 * @param {Number} total - The value to be added to the user's total.
 * @returns {Number} total.
 */
module.exports.transaction = async (
  guildID,
  userID,
  transaction_type,
  memo,
  wallet,
  treasury,
  total
) => {
  //Init
  await this.getEconInfo(guildID, userID);
  const result = await economySchema.findOneAndUpdate(
    {
      guildID,
      userID,
  ***REMOVED***
    {
      guildID,
      userID,
      $inc: {
        wallet,
        treasury,
        total,
    ***REMOVED***
  ***REMOVED***
    {
      new: true,
      upsert: true,
    }
  );

  const transaction = await new transactionSchema({
    guildID,
    userID,
    transaction_type,
    memo,
    wallet,
    treasury,
    total,
  }).save();

  const guildSetting = await guildSettingSchema.findOne({
    guildID,
  });

  const channelID = guildSetting?.transactionLogChannel;

  if (channelID) {
    const cSymbol = await this.getCurrencySymbol(guildID);
    const channel = client.channels.cache.get(channelID);
    const guild = channel.guild;
    const description = `Transaction for <@!${userID}>\nType: \`${transaction_type}\` | ${memo}`;
    channel
      .send({
        embeds: [
          util
            .embedify(
              'GOLD',
              `${transaction._id}`,
              guild.iconURL(),
              description
            )
            .addFields([
              {
                name: '__**Wallet**__',
                value: `${cSymbol}${wallet.toLocaleString()}`,
                inline: true,
            ***REMOVED***
              {
                name: '__**Treasury**__',
                value: `${cSymbol}${treasury.toLocaleString()}`,
                inline: true,
            ***REMOVED***
              {
                name: '__**Total**__',
                value: `${cSymbol}${total.toLocaleString()}`,
                inline: true,
            ***REMOVED***
            ])
            .setTimestamp(),
        ],
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  return result.total;
};

/**
 * Record an infraction.
 * @param {String} guildID - Guild id.
 * @param {String} userID - User id.
 * @param {String} staffID - Staff id.
 * @param {String} type - The punishment for the infraction.
 * @param {String} reason - The reason for the punishment.
 */
module.exports.infraction = async (
  guildID,
  userID,
  staffID,
  type,
  reason,
  permanent,
  active,
  expires
) => {
  const infraction = await new infractionSchema({
    guildID,
    userID,
    staffID,
    type,
    reason,
    permanent,
    active,
    expires,
  }).save();

  const guildSetting = await guildSettingSchema.findOne({
    guildID,
  });

  const channelID = guildSetting?.infractionLogChannel;

  if (channelID) {
    const channel = client.channels.cache.get(channelID);
    const guild = channel.guild;
    const description = `Infraction for <@!${userID}> | Executed by <@!${staffID}>\nType: \`${type}\`\n${reason}`;
    channel
      .send({
        embeds: [
          util
            .embedify('RED', `${infraction._id}`, guild.iconURL(), description)
            .setTimestamp(),
        ],
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
};

/**
 * Gets currency symbol.
 * @param {string} guildID - Guild id.
 * @returns {string} Guild currency symbol
 */
module.exports.getCurrencySymbol = async (guildID) => {
  const result = await guildSettingSchema.findOne({
    guildID,
  });

  let currency;
  if (result?.currency) {
    currency = result.currency;
  } else {
    currency = config.cSymbol; //def
  }

  return currency;
};

/**
 * Updates the min and max payout for the specified income command
 * @param {String} guildID - Guild id.
 * @param {String} command - Income command.
 * @param {Object} properties - Command properties.
 */
module.exports.setCommandStats = async (guildID, command, properties = {}) => {
  await incomeSchema
    .findOneAndUpdate(
      {
        guildID,
    ***REMOVED***
      {
        $set: {
          [command]: properties,
      ***REMOVED***
    ***REMOVED***
      {
        upsert: true,
        new: true,
      }
    )
    .exec();

  return { command: properties };
};

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
      $exists: true,
  ***REMOVED***
  });

  let properties = config.income[command];

  for (const property in properties) {
    if (result?.[command]?.[property]) {
      properties[property] = result[command][property];
    }
  }

  return properties;
};

/**
 * returns the user's properties of the specified command
 * @param {String} guildID - Guild id.
 * @param {String} userID - User id.
 * @param {String} command - Command name.
 * @returns {uProperties} Properties with config taking preference.
 */
module.exports.getUserCommandStats = async (guildID, userID, command) => {
  //Init
  await this.getEconInfo(guildID, userID);
  let result = await economySchema.findOne({
    guildID,
    userID,
  });

  result = result.commands?.[command];
  let properties = config.uCommandStats?.[command];
  for (const property in properties) {
    if (result?.[property]) properties[property] = result[property];
  }

  return properties;
};

/**
 * Updates all specified properties of the command type.
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {string} type - Income command.
 * @param {object} properties - Command properties
 */
module.exports.setUserCommandStats = async (
  guildID,
  userID,
  command,
  properties
) => {
  const key = `commands.${command}`;
  await economySchema.findOneAndUpdate(
    {
      guildID,
      userID,
  ***REMOVED***
    {
      $set: {
        [key]: properties,
    ***REMOVED***
  ***REMOVED***
    {
      new: true,
      upsert: true,
    }
  );
};

/**
 * Get all shop item objects in a guild
 * @param {string} guildID - the id of the target guild
 * @returns {array} item objects array
 */
module.exports.getShopItems = async (
  guildID
) => {
  return await shopItemSchema.find({
    guildID
  })
}

/**
 * @param {Number} min - min value in range
 * @param {Number} max - max value in range
 * @returns {Number} Random value between two inputs
 */
module.exports.intInRange = (min, max) => {
  return Math.ceil(Math.random() * (max - min) + min);
};

/**
 * Returns whether or not a command's cooldown is exhausted.
 * @param {Message} interaction - Slash command interaction.
 * @param {object} properties - Command properties
 * @param {object} uProperties - User command properties
 * @returns {boolean}
 */
module.exports.coolDown = async (interaction, properties, uProperties) => {
  const { cooldown } = properties;
  const { timestamp } = uProperties;
  const now = new Date().getTime();
  if (now - timestamp < cooldown) {
    const embed = this.embedify(
      'GREY',
      interaction.member.user.username,
      '', // interaction.member.user.displayAvatarURL(),
      `:hourglass: You need to wait ${ms(
        cooldown - (now - timestamp)
      )} before using this income command again!`,
      `Cooldown: ${ms(cooldown)}`
    );

    interaction.reply({ embeds: [embed] });

    return false;
  } else {
    return true;
  }
};

/**
 * Returns whether said income command is successful.
 * @param {object} properties - the command properties
 * @returns {boolean} `isSuccess` — boolean
 */
module.exports.isSuccess = (properties) => {
  const { chance } = properties;
  return this.intInRange(0, 100) < chance ? true : false;
};

/**
 * cuts a string if longer than n and appends '...' to the end.
 * @param {string} str - the string to cut
 * @param {number} n - the size which a string must exceed to be cut
 * @param {boolean} rev - whether the string should be cut in reverse (trim the front excess off)
 * @returns {string} `str.substr(0, rev? -n : n)`
 */
module.exports.cut = (str, n = 50, rev = false) => {
  return str.length <= n ?
    str.substr(0, rev ? -n : n) :
    `${str.substr(0, rev ? -n : n)}...`;
};

/**
 * Deletes properties containing specified values from an object.
 * @param {object} o - The object to trim
 * @param {array} exclValues - the values to trim off (delete properties with this)
 * @param {boolean} doIteratedTrim - whether to recursively iterate through properties of an object and trim.
 * @returns `o` - trimmed object
 */
module.exports.trimObj = async (o, exclValues = [undefined, null, [], {}, ""], doIteratedTrim = false) => {
  const iterateTrim = (obj) => {
    Object.keys(obj).forEach(k => {
      kname = k
      k = obj[k]
      if (k instanceof Object) {
        iterateTrim(k)
      } else {
        if (exclValues.includes(obj[kname])) delete obj[kname];
      }
    })
  }

  if (doIteratedTrim === true) {
    iterateTrim(o)
  } else {
    for (p in o) {
      if (exclValues.includes(p)) delete o[p]
    }
  }

  return o;
}

/**
 * Format numbers!
 * @param {number} num - number to format
 * @returns {string} formatted number
 */
module.exports.num = (num) => {
  let pow10 = 1
  let degree = null;

  if (num/1000000000000 > 1) {
    pow10 = 12
    degree = 'T'
  } else if (num/1000000000 > 1) {
    pow10 = 9
    degree = 'B'
  } else if (num/1000000 > 1) {
    pow10 = 6
    degree = 'M'
  } else if (num/1000 > 1) {
    pow10 = 3
    degree = 'K'
  } 

  if (degree) {
    return `${num / (Math.pow(10, pow10)).toFixed(2)}${degree}`
  } else return num // string
}
