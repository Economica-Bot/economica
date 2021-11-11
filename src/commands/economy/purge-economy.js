const economySchema = require('@schemas/economy-sch');
const marketItemSchema = require('@schemas/market-item-sch');
const shopItemSchema = require('@schemas/shop-item-sch');
const inventorySchema = require('@schemas/inventory-sch');
const transactionSchema = require('@schemas/transaction-sch');

module.exports = {
  name: 'purge',
  group: 'economy',
  description: 'Delete economy-related content on the server',
  format: '<inventory | market | balance> [user]',
  global: true,
  roles: [
    {
      name: 'ECONOMY MANAGER',
      required: true,
  ***REMOVED***
  ],
  options: [
    {
      name: 'inventory',
      description: 'Delete inventory data.',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'all',
          description: 'All inventories.',
          type: 'SUB_COMMAND',
          options: null,
      ***REMOVED***
        {
          name: 'user',
          description: 'Specify a user.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Specify a user.',
              type: 'USER',
              required: true,
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'market',
      description: 'Delete market data.',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'all',
          description: 'All listings.',
          type: 'SUB_COMMAND',
          options: null,
      ***REMOVED***
        {
          name: 'user',
          description: 'Specify a user.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Specify a user.',
              type: 'USER',
              required: true,
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'shop',
      description: 'Delete shop data.',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'all',
          description: 'All listings.',
          type: 'SUB_COMMAND',
          options: null,
      ***REMOVED***
        {
          name: 'item',
          description: 'Specify an item.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'item',
              description: 'Specify an item.',
              type: 'STRING',
              required: true,
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'balance',
      description: 'Delete balance data.',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'all',
          description: 'All balances.',
          type: 'SUB_COMMAND',
          options: null,
      ***REMOVED***
        {
          name: 'user',
          description: 'Specify a user.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Specify a user.',
              type: 'USER',
              required: true,
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'transaction',
      description: 'Delete transaction data.',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'all',
          description: 'All transactions.',
          type: 'SUB_COMMAND',
          options: null,
      ***REMOVED***
        {
          name: 'user',
          description: 'Specify a user.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Specify a user.',
              type: 'USER',
              required: true,
          ***REMOVED***
          ],
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction) {
    const guildID = interaction.guild.id;
    const userID = interaction.options.getUser('user').id;
    let color = 'GREEN',
      title = interaction.member.user.tag,
      icon_url = interaction.member.user.displayAvatarURL(),
      description = '';

    if (interaction.options.getSubcommandGroup() === 'inventory') {
      if (interaction.options.getSubcommand() === 'all') {
        await inventorySchema
          .deleteMany({
            guildID,
          })
          .then((result) => {
            description = `Deleted all inventory data. \`${result.n}\` removed.`;
          });
      } else if (interaction.options.getSubcommand() === 'user') {
        await inventorySchema
          .findOneAndDelete({
            guildID,
            userID,
          })
          .then((result) => {
            description = `Deleted inventory data for <@!${userID}>`;
          });
      }
    } else if (interaction.options.getSubcommandGroup() === 'market') {
      if (interaction.options.getSubcommand() === 'all') {
        await marketItemSchema
          .deleteMany({
            guildID,
          })
          .then((result) => {
            description = `Deleted all market data. \`${result.n}\` removed.`;
          });
      } else if (interaction.options.getSubcommand() === 'user') {
        await marketItemSchema
          .deleteMany({
            guildID,
            userID,
          })
          .then((result) => {
            description = `Deleted market data for <@!${userID}>`;
          });
      }
    } else if (interaction.options.getSubcommandGroup() === 'shop') {
      if (interaction.options.getSubcommand() === 'all') {
        await shopItemSchema
          .deleteMany({
            guildID,
          })
          .then(async (result) => {
            description = `Deleted all shop data. \`${result.n}\` removed.`;
            await inventorySchema.deleteMany({
              guildID,
            });
          });
      } else if (interaction.options.getSubcommand() === 'item') {
        const item = interaction.options.getString('item');
        await shopItemSchema
          .deleteMany({
            guildID,
            name: item,
          })
          .then(async (result) => {
            description = `Deleted \`${item}\` from the shop.`;
            await inventorySchema.deleteMany(
              {
                guildID,
            ***REMOVED***
              {
                $pull: {
                  inventory: {
                    name: item,
                ***REMOVED***
              ***REMOVED***
              }
            );
          });
      }
    } else if (interaction.options.getSubcommandGroup() === 'balance') {
      if (interaction.options.getSubcommand() === 'all') {
        await economySchema
          .deleteMany({
            guildID,
          })
          .then((result) => {
            description = `Deleted all balance data. \`${result.n}\` removed.`;
          });
      } else if (interaction.options.getSubcommand() === 'user') {
        await economySchema
          .deleteMany({
            guildID,
            userID,
          })
          .then((result) => {
            description = `Deleted balance data for <@!${userID}>`;
          });
      }
    } else if (interaction.options.getSubCommandGroup() === 'transaction') {
      if (interaction.options.getSubcommand() === 'all') {
        await transactionSchema
          .deleteMany({
            guildID,
          })
          .then((result) => {
            description = `Deleted all transaction data. \`${result.n}\` removed.`;
          });
      } else if (interaction.options.getSubcommand() === 'user') {
        await transactionSchema
          .deleteMany({ guildID, userID })
          .then((result) => {
            description = `Deleted transaction data for <@!${userID}>. \`${result.n}\` removed.`;
          });
      }
    }

    await interaction.reply({
      embeds: [util.embedify(color, title, icon_url, description)],
    });
***REMOVED***
};
