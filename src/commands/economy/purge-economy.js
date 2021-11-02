const economySchema = require('@schemas/economy-sch');
const marketItemSchema = require('@schemas/market-item-sch');
const shopItemSchema = require('@schemas/shop-item-sch');
const inventorySchema = require('@schemas/inventory-sch');

module.exports = {
  name: 'purge',
  group: 'economy',
  description: 'Delete economy-related content on the server',
  format: '<inventory | market | balance> [user]',
  global: true,
  permissions: ['ADMINISTRATOR'],
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
  ],
  async run(interaction) {
    const guildID = interaction.guild.id;
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
        const user = interaction.options.getUser('user');
        await inventorySchema
          .findOneAndDelete({
            guildID,
            userID: user.id,
          })
          .then((result) => {
            description = `Deleted inventory data for <@!${user.id}>`;
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
        const user = interaction.options.getUser('user');
        await marketItemSchema
          .deleteMany({
            guildID,
            userID: user.id,
          })
          .then((result) => {
            description = `Deleted market data for <@!${user.id}>`;
          });
      }
    } else if (interaction.options.getSubcommandGroup() === 'shop') {
      if (interaction.options.getSubcommand() === 'all') {
        await shopItemSchema
          .deleteMany({
            guildID,
          })
          .then((result) => {
            description = `Deleted all shop data. \`${result.n}\` removed.`;
          });
      } else if (interaction.options.getSubcommand() === 'item') {
        const item = interaction.options.getString('item');
        await shopItemSchema
          .deleteMany({
            guildID,
            name: item,
          })
          .then((result) => {
            description = `Deleted \`${item}\` from the market.`;
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
        const user = interaction.options.getUser('user');
        await economySchema
          .deleteMany({
            guildID,
            userID: user.id,
          })
          .then((result) => {
            description = `Deleted balance data for <@!${user.id}>`;
          });
      }
    }

    await interaction.reply({
      embeds: [util.embedify(color, title, icon_url, description)],
    });
***REMOVED***
};
