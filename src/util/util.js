const ms = require('ms');
const config = require('../config.json');

require('module-alias/register');
const econSchema = require('@schemas/economy-sch');
const guildSettingsSchema = require('@schemas/guild-settings-sch');
const incomeSchema = require('@schemas/income-sch');
const infractionSchema = require('@schemas/infraction-sch');
const inventorySchema = require('@schemas/inventory-sch');
const loanSchema = require('@schemas/loan-sch');
const marketItemSchema = require('@schemas/market-item-sch');
const transactionSchema = require('@schemas/transaction-sch');

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
  const balances = await econSchema.find({ guildID }).sort({ total: -1 });
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
    await new econSchema({
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
  const result = await econSchema.findOneAndUpdate(
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

  const guildSetting = await guildSettingsSchema.findOne({
    guildID,
  });

  const channelID = guildSetting?.transactionLogChannel;

  if (channelID) {
    const cSymbol = await this.getCurrencySymbol(guildID);
    const channel = client.channels.cache.get(channelID);
    const guild = channel.guild;
    const description = `Transaction for <@!${userID}>\nType: \`${transaction_type}\` | ${memo}`;
    channel.send({
      embeds: [
        util
          .embedify('GOLD', `${transaction._id}`, guild.iconURL(), description)
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

  const guildSetting = await guildSettingsSchema.findOne({
    guildID,
  });

  const channelID = guildSetting?.infractionLogChannel;

  if (channelID) {
    const channel = client.channels.cache.get(channelID);
    const guild = channel.guild;
    const description = `Infraction for <@!${userID}> | Executed by <@!${staffID}>\nType: \`${type}\`\n${reason}`;
    channel.send({
      embeds: [
        util
          .embedify('RED', `${infraction._id}`, guild.iconURL(), description)
          .setTimestamp(),
      ],
    });
  }
};

/**
 * Gets currency symbol.
 * @param {string} guildID - Guild id.
 * @returns {string} Guild currency symbol
 */
module.exports.getCurrencySymbol = async (guildID) => {
  const result = await guildSettingsSchema.findOne({
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
module.exports.setCommandStats = async (guildID, properties) => {
  await guildSettingsSchema.findOneAndUpdate(
    { guildID },
    {
      $pull: {
        commands: {
          command: properties.command,
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
    {
      upsert: true,
    }
  );

  await guildSettingsSchema.findOneAndUpdate(
    { guildID },
    {
      $push: {
        commands: {
          ...properties,
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
    {
      upsert: true,
    }
  );

  return { command: properties };
};

/**
 * Returns the specified income command's min and max payout values
 * @param {string} guildID - The id of the guild.
 * @param {string} command - The type of income command.
 * @returns {properties} Properties with config taking preference.
 */
module.exports.getCommandStats = async (guildID, command) => {
  let result = await guildSettingsSchema.findOne({
    guildID,
  });

  result = result.commands.find((c) => c.command === command);

  let properties = config.commands[command] || config.commands['default'];

  for (const property in properties) {
    if (result?.[property]) {
      properties[property] = result[property];
    }
  }

  return properties;
};

/**
 * returns the user's properties of the specified command
 * @param {String} guildID - Guild id.
 * @param {String} userID - User id.
 * @param {String} command - Command name.
 * @returns {uProperties} Command properties.
 */
module.exports.getUserCommandStats = async (guildID, userID, command) => {
  //Init
  await this.getEconInfo(guildID, userID);

  let result = await econSchema.findOne({
    guildID,
    userID,
  });

  let properties = {
    timestamp: 0,
  };

  result = result.commands.find((c) => c.command === command);
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
module.exports.setUserCommandStats = async (guildID, userID, properties) => {
  await econSchema.findOneAndUpdate(
    { guildID, userID },
    {
      $pull: {
        commands: {
          command: properties.command,
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
    {
      upsert: true,
    }
  );

  await econSchema.findOneAndUpdate(
    { guildID, userID },
    {
      $push: {
        commands: {
          ...properties,
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
    {
      upsert: true,
    }
  );
};

/**
 * @param {Number} min - min value in range
 * @param {Number} max - max value in range
 * @returns {Number} Random value between two inputs
 */
module.exports.intInRange = (min, max) => {
  return Math.ceil(Math.random() * (max - min) + min);
};

/**
 * Returns whether income command is successful.
 * @param {Object} properties - the command properties
 * @returns {Boolean} `isSuccess` — boolean
 */
module.exports.isSuccess = (properties) => {
  const { chance } = properties;
  return this.intInRange(0, 100) < chance ? true : false;
};

/**
 * Initialize guild settings.
 * @param {Discord.Guild} guild
 * @returns
 */
module.exports.initGuildSettings = async (guild) => {
  const guildSettings = await guildSettingsSchema.findOneAndUpdate(
    {
      guildID: guild.id,
  ***REMOVED***
    {
      modules: [],
      commands: [],
      currency: null,
      transactionLogChannel: null,
      infractionLogChannel: null,
  ***REMOVED***
    {
      upsert: true,
      new: true,
    }
  );

  return guildSettings;
};
