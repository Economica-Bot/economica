const marketItemSchema = require('@schemas/market-item-sch');
const inventorySchema = require('@schemas/inventory-sch');

module.exports = {
  name: 'listing',
  group: 'market',
  description: 'Interact with the server market.',
  format: '<view | create | delete | enable | disable> [...options]',
  global: true,
  roles: [
    {
      name: 'ECONOMY MANAGER',
      required: false,
  ***REMOVED***
  ],
  options: [
    {
      name: 'view',
      description: 'View listings.',
      type: 1, //SUB_COMMAND
      options: [
        {
          name: 'user',
          description: 'Specify a user.',
          type: 6, //USER
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'create',
      description: 'Create a new listing.',
      type: 1,
      options: [
        {
          name: 'item',
          description: 'The listing name.',
          type: 3, //STRING
          required: true,
      ***REMOVED***
        {
          name: 'price',
          description: 'This listing price.',
          type: 4, //INTEGER
          required: true,
      ***REMOVED***
        {
          name: 'description',
          description: 'The listing description.',
          type: 3,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'delete',
      description: 'Delete a market listing.',
      type: 1,
      options: [
        {
          name: 'user',
          description: 'Specify a user.',
          type: 6,
          required: true,
      ***REMOVED***
        {
          name: 'item',
          description: 'The listing name.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'enable',
      description: 'Enable a market listing.',
      type: 1,
      options: [
        {
          name: 'item',
          description: 'The listing item.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'disable',
      description: 'Disable a market listing.',
      type: 1,
      options: [
        {
          name: 'item',
          description: 'The listing item.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const guildID = guild.id;
    let color = 'BLURPLE',
      title = author.user.username,
      icon_url = author.user.displayAvatarURL(),
      description = '',
      footer = '',
      ephemeral = false;
    const embed = new Discord.MessageEmbed();
    const currencySymbol = await util.getCurrencySymbol(guildID);

    if (options._subcommand === 'view') {
      const user = options._hoistedOptions?.[0]?.user ?? author.user;
      (title = user.username), (icon_url = user.displayAvatarURL());
      const listings = await marketItemSchema.find({
        guildID,
        userID: user.id,
      });

      let i = 0,
        j = 0;
      if (listings) {
        for (const listing of listings) {
          i++;
          if (listing.active) j++;
          embed.addField(
            `${currencySymbol}${listing.price.toLocaleString()} | \`${
              listing.item
            }\``,
            `${listing.description} | ${
              listing.active ? 'Listing **active**' : 'Listing **inactive**'
            }`
          );
        }
      }

      description = `Total Listings: \`${i}\` | Active Listings: \`${j}\``;
    } else if (options._subcommand === 'create') {
      const item = options._hoistedOptions[0].value;
      const price = options._hoistedOptions[1].value;
      const desc = options._hoistedOptions[2].value ?? 'No description';

      const listing = await marketItemSchema.findOne({
        guildID,
        userID: author.user.id,
        item,
        active: true,
      });

      if (listing) {
        color = 'RED';
        description = `You already have a(n) \`${item}\` for sale.`;
        footer = 'Please use a different name.';
      } else {
        await new marketItemSchema({
          userID: author.user.id,
          guildID,
          item,
          price,
          description: desc,
          active: true,
        }).save();

        color = 'GREEN';
        description = `Successfully created a listing for \`${item}\``;
        embed.addFields([
          {
            name: 'Price',
            value: `${currencySymbol}${price.toLocaleString()}`,
            inLine: true,
        ***REMOVED***
          {
            name: 'Description',
            value: desc,
            inLine: true,
        ***REMOVED***
        ]);
      }
    } else if (options._subcommand === 'delete') {
      const econManagerRole = guild.roles.cache.find((r) => {
        return r.name.toLowerCase() === 'economy manager';
      });

      if (!author.roles.cache.has(econManagerRole.id)) {
        description = `You must have the <@&${econManagerRole.id}> role to delete a user's listings.`;
        ephemeral = true;
      } else {
        const user = options._hoistedOptions[0].user;
        const item = options._hoistedOptions[1].value;
        const listing = await marketItemSchema.findOneAndDelete({
          guildID,
          userID: user.id,
          item,
        });

        if (!listing) {
          color = 'RED';
          description = `Could not find \`${item}\``;
        } else {
          const items = await inventorySchema.updateMany(
            { guildID, 'inventory.item': item },
            { $pull: { inventory: { item } } }
          );

          color = 'GREEN';
          description = `Successfully deleted \`${item}\` from market DB.`;
          footer = item ? `${items.n} items removed.` : '';
        }
      }
    } else if (options._subcommand === 'enable') {
      const item = options._hoistedOptions[0].value;

      const listing = await marketItemSchema.findOneAndUpdate(
        { guildID, userID: author.user.id, item, active: false },
        { active: true }
      );

      if (!listing) {
        color = 'RED';
        description = `Could not find \`${item}\` as an inactive listing under your id.`;
        footer = 'Check your listings with `listing view`.';
      } else {
        color = 'GREEN';
        description = `Successfully enabled \`${item}\` on the market.`;
      }
    } else if (options._subcommand === 'disable') {
      const item = options._hoistedOptions[0].value;

      const listing = await marketItemSchema.findOneAndUpdate(
        { guildID, userID: author.user.id, item, active: true },
        { active: false }
      );

      if (!listing) {
        color = 'RED';
        description = `Could not find \`${item}\` as an active listing under your id.`;
        footer = 'Check your listings with `listing view`.';
      } else {
        color = 'GREEN';
        description = `Successfully disabled \`${item}\` on the market.`;
      }
    }

    embed
      .setColor(color)
      .setAuthor(title, icon_url)
      .setDescription(description)
      .setFooter(footer);

    await interaction.reply({ embeds: [embed], ephemeral });
***REMOVED***
};
