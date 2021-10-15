const ms = require('ms');
const shopItemSchema = require('@schemas/shop-item-sch');
const inventorySchema = require('@schemas/inventory-sch');

const globalCreateOptions = {
  required: [
    {
      name: 'name',
      description:
        'The name of the item. This is also how it will be referenced for future actions.',
      type: apiTypes.String,
      required: true,
  ***REMOVED***
    {
      name: 'price',
      description:
        'The cost of the item and the minimum balance needed to purchase.',
      type: apiTypes.Integer,
      required: true,
  ***REMOVED***
  ],
  optional: [
    {
      name: 'description',
      description: 'The description/info of the item.',
      type: apiTypes.String,
      required: false,
  ***REMOVED***
    {
      name: 'duration',
      description: 'Time until the item is deactivated in the shop.',
      type: apiTypes.String,
      required: false,
  ***REMOVED***
    {
      name: 'stock',
      description:
        'Quantity of this item that can be purchased until the item is deactivated in the shop.',
      type: apiTypes.Integer,
      required: false,
  ***REMOVED***
    {
      name: 'is_inventory_item',
      description:
        'If the item is to be stored in the inventory of the buyer. True/False',
      type: apiTypes.Boolean,
      required: false,
  ***REMOVED***
    {
      name: 'required_role',
      description: 'Role that a user must have to purchase.',
      type: apiTypes.Role,
      required: false,
  ***REMOVED***
    {
      name: 'required_items',
      description:
        'Inventory items or generators that a user must have to purchase.',
      type: apiTypes.String,
      required: false,
  ***REMOVED***
    {
      name: 'required_balance',
      description:
        'The minimum balance that a user must have to purchase. Cannot be lower than the item price.',
      type: apiTypes.Integer,
      required: false,
  ***REMOVED***
    {
      name: 'role_given',
      description: 'A list of role mentions given on item purchase.',
      type: apiTypes.Role,
      required: false,
  ***REMOVED***
    {
      name: 'role_removed',
      description: 'A list of role mentions removed on item purchase.',
      type: apiTypes.Role,
      required: false,
  ***REMOVED***
  ],
};

module.exports = {
  name: 'item',
  description: "Perform actions with the shop's items.",
  group: 'shop',
  global: true,
  options: [
    {
      name: 'edit',
      description: 'Edit an item in the shop.',
      type: apiTypes.Subcommand,
      options: [
        {
          name: 'name',
          description:
            'The name of the item to edit.',
          type: apiTypes.String,
          required: true,
      ***REMOVED***
        {
          name: 'replace_all',
          description: 'Whether to replace all omitted',
          type: apiTypes.Boolean,
          required: false
      ***REMOVED***
        {
          name: 'new_name',
          description:
            'The new name of the item, if desired.',
          type: apiTypes.String,
          required: false,
      ***REMOVED***
        {
          name: 'price',
          description:
            'The new cost of the item and the minimum cash balance needed to purchase.',
          type: apiTypes.Integer,
          required: false,
      ***REMOVED***
        {
          name: 'description',
          description: 'The new description/info of the item.',
          type: apiTypes.String,
          required: false,
      ***REMOVED***
        {
          name: 'duration',
          description: 'the updated time until the item is deactivated in the shop.',
          type: apiTypes.String,
          required: false,
      ***REMOVED***
        {
          name: 'stock',
          description:
            'The updated quantity of this item remaining in the shop.',
          type: apiTypes.Integer,
          required: false,
      ***REMOVED***
        {
          name: 'is_inventory_item',
          description:
            'If the item is to be stored in the inventory of the buyer. True/False',
          type: apiTypes.Boolean,
          required: false,
      ***REMOVED***
        {
          name: 'required_role',
          description: 'The new role that a user must have to purchase.',
          type: apiTypes.Role,
          required: false,
      ***REMOVED***
        {
          name: 'required_items',
          description:
            'New inventory items or generators that a user must have to purchase.',
          type: apiTypes.String,
          required: false,
      ***REMOVED***
        {
          name: 'required_balance',
          description:
            'The minimum balance that a user must have to purchase. Cannot be lower than the item price.',
          type: apiTypes.Integer,
          required: false,
      ***REMOVED***
        {
          name: 'role_given',
          description: 'A list of role mentions given on item purchase.',
          type: apiTypes.Role,
          required: false,
      ***REMOVED***
        {
          name: 'role_removed',
          description: 'A list of role mentions removed on item purchase.',
          type: apiTypes.Role,
          required: false,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'buy',
      description: 'Buy an item from the shop.',
      type: apiTypes.Subcommand,
      options: [
        {
          name: 'name',
          description: 'The name of the item to be purchased.',
          type: apiTypes.String,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'delete',
      description: 'Delete an item from the shop.',
      type: apiTypes.Subcommand,
      options: [
        {
          name: 'name',
          description: 'The name of the item to be deleted',
          type: apiTypes.String,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'view',
      description: 'View an item in more detail.',
      type: apiTypes.Subcommand,
      options: [
        {
          name: 'name',
          description: 'The name of the item to view',
          type: apiTypes.String,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'create',
      description: 'Create a new shop item.',
      type: apiTypes.SubcommandGroup,
      options: [
        {
          name: 'generator',
          description:
            'Create a new shop item that automatically generates money periodically.',
          type: apiTypes.Subcommand,
          options: [
            ...globalCreateOptions.required,
            {
              name: 'generator_period',
              description: 'The period of time between money generating',
              type: apiTypes.String,
              required: true,
          ***REMOVED***
            {
              name: 'generator_amount',
              description: 'The amount of money generated after each period.',
              type: apiTypes.Integer,
              required: true,
          ***REMOVED***
            ...globalCreateOptions.optional,
            {
              name: 'is_deposited',
              description:
                'Is the generated money auto deposited to bank? True/False',
              type: apiTypes.Boolean,
              required: false,
          ***REMOVED***
          ],
      ***REMOVED***
        {
          name: 'basic',
          description: 'Create a basic shop item without a template.',
          type: apiTypes.Subcommand,
          options: [
            ...globalCreateOptions.required,
            ...globalCreateOptions.optional,
          ],
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction, guild, member, options, fops) {
    const { _group, _subcommand, _hoistedOptions } = options;

    const clientMember = guild.members.cache.get(interaction.client.user.id)

    options = {};
    _hoistedOptions.forEach((o) => {
      options[o.name] = o.value;
    });

    // Validation
    if (_group === 'create') {
      // global options for item creation

      // global required options
      if (!(options.name.length <= 200))
        return await interaction.reply(
          util.error('`name` must be 200 characters or less.')
        );
      if (
        await shopItemSchema.findOne({
          guildID: guild.id,
          name: { $regex: new RegExp(options.name, 'i') },
        })
      )
        return await interaction.reply(
          util.error(`An item with \`name\` "${options.name}" already exists.`)
        );
      if (options.name.includes(','))
        return await interaction.reply(
          util.error('`name` must not contain commas.')
        );
      if (!(options.price >= 0))
        return await interaction.reply(
          util.error('`price` must be 0 or greater.')
        );

      // global optional options
      if (options.description && !(options.description?.length <= 400))
        return await interaction.reply(
          util.error('`description` must be 400 characters or less.')
        );
      if (options.duration) {
        if (!ms(options.duration))
          return await interaction.reply(
            util.error(
              '`duration` must be a parseable duration value (5000, 5s, 5m, etc...) and greater than 0.'
            )
          );
        options.duration = +options.duration || ms(options.duration);
      }
      if (options.stock && !(options.stock >= 0))
        return await interaction.reply(
          util.error('`stock` must be 0 or greater.')
        );
      if (options.role_given) {
        const role_given = await guild.roles.cache.get(options.role_given);
        if (clientMember.roles.highest.rawPosition <= role_given.rawPosition)
          return await interaction.reply(
            util.error(
              "`role_given` is higher than the bot's highest role and cannot be added."
            )
          ); // role is too high!
        if (role_given.managed)
          return await interaction.reply(
            util.error(
              '`role_given` cannot be a bot role (integration-managed).'
            )
          ); // role can't be added
      }
      if (options.role_removed) {
        const role_removed = await guild.roles.cache.get(options.role_removed);
        if (clientMember.roles.highest.rawPosition <= role_removed.rawPosition)
          return await interaction.reply(
            util.error(
              "`role_removed` is higher than the bot's highest role and cannot be removed."
            )
          ); // role is too high!
        if (role_removed.managed)
          return await interaction.reply(
            util.error(
              '`role_removed` cannot be a bot role (integration-managed).'
            )
          ); // role can't be added
      }
      let requiredItemsArray = [];
      if (options.required_items) {
        for (item of `,${options.required_items},`
          .replace(/[\s,]+/g, ',')
          .split(',')) {
          if (item) {
            const dbItem = await shopItemSchema.findOne({
              guildID: guild.id,
              name: {
                $regex: new RegExp(item, 'i'),
            ***REMOVED***
            })
            if (
              !(dbItem)
              // string is not an item in the shop
            ) {
              return await interaction.reply(
                util.error(
                  `Could not find item "${item}" in shop!\n\n\`required_items\` must be a valid shop item name or list of valid shop item names separated by comma(s) \`,\``
                )
              );
            } else {
              requiredItemsArray.push(dbItem.name);
            }
          }
        }
      }
      if (
        options.required_balance &&
        !(options.required_balance >= options.price)
      )
        return await interaction.reply(
          util.error(
            `\`required_balance\` must be greater than \`price\` (${options.price}).`
          )
        );
      // type<Type> validation
      if (_subcommand !== 'basic') {
        if (_subcommand === 'generator') {
          // typeGenerator
          if (!ms(options.generator_period))
            return await interaction.reply(
              util.error(
                '`generator_period` must be a parseable duration value (5000, 5s, 5m, etc...) and greater than 0.'
              )
            );
          if (!(options.generator_amount > 0))
            return await interaction.reply(
              util.error('`generator_amount` must be greater than 0.')
            );
          options.generator_period =
            +options.generator_period || +ms(options.generator_period); // parseInt
        }
      }

      let editedItem = {
        requirements: {}
      }

      console.log(options)

      if (options.name) {
        editedItem['name'] = options.name
      }
      if (options.price) {
        editedItem['price'] = options.price
      }
      if (options.description) {
        editedItem['description'] = options.description
      }
      if (options.duration) {
        editedItem['duration'] = options.duration
      }
      if (options.stock) {
        editedItem['stockLeft'] = options.stock
      }
      if (options.is_inventory_item) {
        editedItem['isInvetoryItem'] = options.is_inventory_item
      }
      if (options.role_given) {
        editedItem['rolesGivenArray'] = [options.role_given]
      }
      if (options.role_removed) {
        editedItem['rolesRemovedArray'] = [options.role_removed]
      }
      if (options.required_role) {
        editedItem.requirements['requiredRolesArray'] = [options.required_role]
      }
      if (options.required_items) {
        console.log(requiredItemsArray)
        editedItem.requirements['requiredInventoryItemsArray'] = requiredItemsArray
      } else delete editedItem.requirements['requiredInventoryItemsArray']
      if (options.required_balance) {
        editedItem.requirements['requiredBalance'] = options.required_balance
      }

      if (!(Object.keys(editedItem.requirements).length)) delete editedItem.requirements

      await new shopItemSchema({
        guildID: guild.id,
        ...editedItem
      }).save()

      let description = ``;
      _hoistedOptions.forEach((o) => {
        const thisEntry = `${o.name}: ${o.value}`;
        description = `${description}${thisEntry}\n`;
      });
      await interaction.reply({
        embeds: [
          {
            color: 'BLUE',
            title: `item ${_group} ${_subcommand} request sent to DB with info:`,
            description: `\`\`\`${description}\`\`\``,
        ***REMOVED***
        ],
      });
    } else if (_subcommand === 'view') {
      const item = await shopItemSchema.findOne({
        guildID: guild.id,
        name: {
          $regex: new RegExp(options.name, 'i'),
      ***REMOVED***
      });

      if (!item) return await interaction.reply(util.error(`No item found with name ${options.name}`));
      const currencySymbol = await util.getCurrencySymbol(guild.id);

      let embed = new Discord.MessageEmbed();
      embed.setColor('BLUE');
      embed.setAuthor(member.user.username, member.user.displayAvatarURL());
      embed.setTitle(item.name);
      embed.setDescription(item.description || 'A very interesting item.');
      embed.setFooter(`ID: ${item._id}`)

      embed.addField(
        'Price',
        `${currencySymbol}${item.price > 0 ? item.price.toLocaleString() : 'Free'
        }`,
        true
      );
      const createdAt = new Date(item.createdAt);
      embed.addField('Date Created', `${createdAt.toUTCString()}`, true);
      embed.addField(
        'Type',
        `${item.type === 'typeGenerator' ? 'Generator' : 'Basic'}`,
        false
      );
      embed.addField(
        'Stock Remaining',
        `${item.stockLeft?.toLocaleString() || 'Infinite'}`,
        true
      );
      embed.addField(
        'Expires In',
        item.expiresOnTimestamp ? ms(item.expiresOnTimestamp - Date.now()) : 'Never',
        true
      )
      embed.addField(
        'Role Given',
        `${item.rolesGivenArray?.[0]
          ? '<@&' + item.rolesGivenArray?.[0] + '>'
          : 'None'
        }`,
        true
      );
      embed.addField(
        'Role Removed',
        `${item.rolesRemovedArray?.[0]
          ? '<@&' + item.rolesRemovedArray?.[0] + '>'
          : 'None'
        }`,
        true
      );
      embed.addField(
        'Role Required',
        `${item.requirements?.requiredRolesArray?.[0]
          ? '<@&' + item.requirements?.requiredRolesArray?.[0] + '>'
          : 'None'
        }`,
        true
      );
      embed.addField(
        'Minimum Balance',
        `${currencySymbol}${item.requirements?.requiredBalance?.toLocaleString() || '0'}`,
        true
      );
      embed.addField(
        'Items Required',
        item.requirements?.requiredInventoryItemsArray?.length > 0 ? `\`${item.requirements?.requiredInventoryItemsArray?.join('`, `')}\`` : 'None',
        false
      );

      if (item.type === 'typeGenerator') {
        embed.addField(
          'Generator Period',
          `${ms(item.generator_period)}`,
          true
        );
        embed.addField(
          'Generator Amount',
          `${currencySymbol}${item.generator_amount}`,
          true
        );
        embed.addField(
          'Income Deposited?',
          `${item.isIncomeDeposited !== undefined ? item.isIncomeDeposited : true
          }`,
          true
        );
      }

      await interaction.reply({ embeds: [embed] });
    } else if (_subcommand === 'delete') {
      const item = await shopItemSchema.findOne({
        guildID: guild.id,
        name: {
          $regex: new RegExp(options.name, 'i'),
      ***REMOVED***
      })
      if (
        item
      ) {
        await shopItemSchema.deleteOne({
          guildID: guild.id,
          name: {
            $regex: new RegExp(options.name, 'i'), // case-insensitive search
        ***REMOVED***
        });

        let embed = new Discord.MessageEmbed();
        embed.setColor('GREEN');
        embed.setAuthor(member.user.username, member.user.displayAvatarURL());
        embed.setDescription(
          `Successfully deleted item with name \`${item.name}\``
        );

        await interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply(
          util.error(`No item found with \`name\` "${options.name}"`)
        );
      }
    } else if (_subcommand === 'buy') {
      const item = await shopItemSchema.findOne({
        guildID: guild.id,
        name: options.name,
      });

      if (!item) {
        interaction.reply("Item doesn't exist");
        return;
      }

      const inventory = (
        await inventorySchema.findOne({
          guildID: guild.id,
          userID: author.user.id,
        })
      ).inventory;

      const inventoryItem = inventory?.find((item) => {
        return item.ref === options.name;
      });

      const { wallet } = util.getEconInfo(guild.id, author.user.id);

      if (item.price > wallet) {
        interaction.reply('You cannot afford this item.');
        return;
      }

      if (inventoryItem) {
        await inventorySchema.findOneAndUpdate(
          {
            guildID: guild.id,
            userID: author.user.id,
            'inventory.ref': inventoryItem.ref,
        ***REMOVED***
          {
            $inc: {
              'inventory.$.amount': 1,
          ***REMOVED***
          }
        );
      } else {
        await inventorySchema.findOneAndUpdate(
          {
            guildID: guild.id,
            userID: author.user.id,
        ***REMOVED***
          {
            $push: {
              inventory: {
                name: item.name,
                amount: 1,
            ***REMOVED***
          ***REMOVED***
          }
        );
      }

      util.transaction(
        guild.id,
        author.user.id,
        'PURCHASE_SHOP_ITEM',
        `Purchased ${item.name}`,
        -item.price,
        0,
        -item.price
      );

      interaction.reply(`You bought ${item.name}`);
    } else if (_subcommand === 'edit') {
      // validation
      const targetItem = await shopItemSchema.findOne({
        guildID: guild.id,
        name: { $regex: new RegExp(options.name, 'i') }
      })

      if (!targetItem) {
        return await interaction.reply(util.error(`No item with name ${options.name} found in the shop!`))
      }
      if ((options.new_name?.length > 200))
        return await interaction.reply(
          util.error('`new_name` must be 200 characters or less.')
        );
      if (
        await shopItemSchema.findOne({
          guildID: guild.id,
          new_name: { $regex: new RegExp(options.new_name, 'i') },
        })
      )
        return await interaction.reply(
          util.error(`An item with \`new_name\` "${options.new_name}" already exists.`)
        );
      if (options.new_name?.includes(','))
        return await interaction.reply(
          util.error('`new_name` must not contain commas.')
        );
      if (options.price && !(options?.price >= 0))
        return await interaction.reply(
          util.error('`price` must be 0 or greater.')
        );

      // global optional options
      if (options.description && !(options.description?.length <= 400))
        return await interaction.reply(
          util.error('`description` must be 400 characters or less.')
        );
      if (options.duration) {
        if (!ms(options.duration))
          return await interaction.reply(
            util.error(
              '`duration` must be a parseable duration value (5000, 5s, 5m, etc...) and greater than 0.'
            )
          );
        options.duration = +options.duration;
      }
      if (options.stock) {
        if (options.stock < 0) {
          options.stock = undefined
        }
      }
      if (options.role_given) {
        const role_given = await guild.roles.cache.get(options.role_given);
        if (clientMember.roles.highest.rawPosition <= role_given.rawPosition)
          return await interaction.reply(
            util.error(
              "`role_given` is higher than the bot's highest role and cannot be added."
            )
          ); // role is too high!
        if (role_given.managed)
          return await interaction.reply(
            util.error(
              '`role_given` cannot be a bot role (integration-managed).'
            )
          ); // role can't be added
      }
      if (options.role_removed) {
        const role_removed = await guild.roles.cache.get(options.role_removed);
        if (clientMember.roles.highest.rawPosition <= role_removed.rawPosition)
          return await interaction.reply(
            util.error(
              "`role_removed` is higher than the bot's highest role and cannot be removed."
            )
          ); // role is too high!
        if (role_removed.managed)
          return await interaction.reply(
            util.error(
              '`role_removed` cannot be a bot role (integration-managed).'
            )
          ); // role can't be added
      }
      let requiredItemsArray = [];
      if (options.required_items) {
        for (item of `,${options.required_items},`
          .replace(/[\s,]+/g, ',')
          .split(',')) {
          if (item) {
            const dbItem = await shopItemSchema.findOne({
              guildID: guild.id,
              name: {
                $regex: new RegExp(item, 'i'),
            ***REMOVED***
            })
            if (
              !(dbItem)
              // string is not an item in the shop
            ) {
              return await interaction.reply(
                util.error(
                  `Could not find item "${item}" in shop!\n\n\`required_items\` must be a valid shop item name or list of valid shop item names separated by comma(s) \`,\``
                )
              );
            } else {
              requiredItemsArray.push(dbItem.name);
            }
          }
        }
      }
      if (
        options.required_balance &&
        !(options.required_balance >= options.price)
      ) {
        return await interaction.reply(
          util.error(
            `\`required_balance\` must be greater than \`price\` (${options.price}).`
          )
        );
      }

      let editedItem = {
        requirements: {}
      }

      if (options.new_name) {
        editedItem['name'] = options.new_name
      }
      if (options.price) {
        editedItem['price'] = options.price
      }
      if (options.description) {
        editedItem['description'] = options.description
      }
      if (options.duration) {
        editedItem['duration'] = options.duration
      }
      if (options.stock) {
        editedItem['stockLeft'] = options.stock
      }
      if (options.is_inventory_item) {
        editedItem['isInvetoryItem'] = options.is_inventory_item
      }
      if (options.role_given) {
        editedItem['rolesGivenArray'] = [options.role_given]
      }
      if (options.role_removed) {
        editedItem['rolesRemovedArray'] = [options.role_removed]
      }
      if (options.required_role) {
        editedItem.requirements['requiredRolesArray'] = [options.required_role]
      }
      if (options.required_items) {
        console.log(requiredItemsArray)
        editedItem.requirements['requiredInventoryItemsArray'] = requiredItemsArray
      } else delete editedItem.requirements['requiredInventoryItemsArray']
      if (options.required_balance) {
        editedItem.requirements['requiredBalance'] = options.required_balance
      }

      if (!(Object.keys(editedItem.requirements).length)) delete editedItem.requirements

      if (
        targetItem
      ) {
        await shopItemSchema.findOneAndUpdate({
          guildID: guild.id,
          name: {
            $regex: new RegExp(options.name, 'i')
          }
      ***REMOVED*** editedItem)
      }

      console.log(await shopItemSchema.findOne({
        guildID: guild.id,
        _id: targetItem._id
      }))

      // execution (callback)
      let description = ``;
      _hoistedOptions.forEach((o) => {
        const thisEntry = `${o.name}: ${o.value}`;
        description = `${description}${thisEntry}\n`;
      });
      await interaction.reply({
        embeds: [
          {
            color: 'BLUE',
            title: `item ${_subcommand} request sent to DB with info:`,
            description: `\`\`\`${description}\`\`\``,
        ***REMOVED***
        ],
      });
    }
***REMOVED***
};
