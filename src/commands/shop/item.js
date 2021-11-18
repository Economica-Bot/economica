const ms = require('ms');
const path = require('path');
const shopItemSchema = require('@schemas/shop-item-sch');
const inventorySchema = require('@schemas/inventory-sch');
const util = require(path.join(__dirname, '../../util/util'));

const globalCreateOptions = {
	required: [
		{
			name: 'name',
			description:
				'The name of the item. This is also how it will be referenced for future actions.',
			type: 'STRING',
			required: true,
		},
		{
			name: 'price',
			description:
				'The cost of the item and the minimum balance needed to purchase.',
			type: 'INTEGER',
			required: true,
		},
		{
			name: 'stackable',
			description: 'Whether or not this item can stack.',
			type: 'BOOLEAN',
			required: true,
		},
	],
	optional: [
		{
			name: 'description',
			description: 'The description/info of the item.',
			type: 'STRING',
			required: false,
		},
		{
			name: 'duration',
			description: 'Time until the item is deactivated in the shop.',
			type: 'STRING',
			required: false,
		},
		{
			name: 'stock',
			description:
				'Quantity of this item that can be purchased until the item is deactivated in the shop.',
			type: 'INTEGER',
			required: false,
		},
		{
			name: 'required_role',
			description: 'Role that a user must have to purchase.',
			type: 'ROLE',
			required: false,
		},
		{
			name: 'required_items',
			description:
				'Inventory items or generators that a user must have to purchase.',
			type: 'STRING',
			required: false,
		},
		{
			name: 'required_bank',
			description:
				'The minimum bank balance that a user must have to purchase. Cannot be lower than the item price.',
			type: 'INTEGER',
			required: false,
		},
		{
			name: 'role_given',
			description: 'A list of role mentions given on item purchase.',
			type: 'ROLE',
			required: false,
		},
		{
			name: 'role_removed',
			description: 'A list of role mentions removed on item purchase.',
			type: 'ROLE',
			required: false,
		},
	],
};

module.exports = {
	name: 'item',
	description: "Perform actions with the shop's items.",
	group: 'shop',
	global: true,
	roles: [
		{
			name: 'ECONOMY MANAGER',
			required: false,
		},
	],
	options: [
		{
			name: 'buy',
			description: 'Buy an item from the shop.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'name',
					description: 'The name of the item to be purchased.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'deactivate',
			description: 'Deactivate an item from the shop.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'name',
					description: 'The name of the item to be reactivated.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'reactivate',
			description: 'Reactivate an item from the shop.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'name',
					description: 'The name of the item to be removed.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'view',
			description: 'View an item in more detail.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'name',
					description: 'The name of the item to view',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'create',
			description: 'Create a new shop item.',
			type: 'SUB_COMMAND_GROUP',
			options: [
				{
					name: 'generator',
					description:
						'Create a new shop item that automatically generates money periodically.',
					type: 'SUB_COMMAND',
					options: [
						...globalCreateOptions.required,
						{
							name: 'generator_period',
							description: 'The period of time between money generating',
							type: 'STRING',
							required: true,
						},
						{
							name: 'generator_amount',
							description: 'The amount of money generated after each period.',
							type: 'INTEGER',
							required: true,
						},
						...globalCreateOptions.optional,
					],
				},
				{
					name: 'basic',
					description: 'Create a basic shop item without a template.',
					type: 'SUB_COMMAND',
					options: [
						...globalCreateOptions.required,
						...globalCreateOptions.optional,
					],
				},
			],
		},
	],
	async run(interaction) {
		const clientMember = interaction.guild.members.cache.get(
			interaction.client.user.id
		);

		// global options for item creation

		const name = interaction.options.getString('name');
		const price = interaction.options.getInteger('price');
		const required_bank = interaction.options.getInteger('required_bank');
		const description = interaction.options.getString('description');
		const duration = interaction.options.getString('duration');
		const expires = duration ? true : false;
		const stackable = interaction.options.getBoolean('stackable');
		const stock = interaction.options.getInteger('stock');
		const role_given = interaction.options.getRole('role_given');
		const role_removed = interaction.options.getRole('role_removed');
		const required_items = interaction.options.getString('required_items');
		const required_role = interaction.options.getRole('required_role');
		const type = interaction.options.getSubcommand();
		const generator_period = interaction.options.getString('generator_period');
		const generator_amount = interaction.options.getInteger('generator_amount');

		// Create an item
		if (['basic', 'generator'].includes(interaction.options.getSubcommand())) {
			const econManagerRole = guild.roles.cache.find((r) => {
				return r.name.toLowerCase() === 'economy manager';
			});

			if (!author.roles.cache.has(econManagerRole.id)) {
				return await interaction.reply(
					util.error(
						`You must have the <@&${econManagerRole.id}> role to create items.`
					)
				);
			}

			// global required options
			if (name.length > 200)
				return await interaction.reply(
					util.error('`name` must be 200 characters or less.')
				);
			if (
				await shopItemSchema.findOne({
					guildID: interaction.guild.id,
					name: {
						$regex: new RegExp(name, 'i'),
					},
				})
			) {
				return await interaction.reply(
					util.error(`An item with \`name\` "${name}" already exists.`)
				);
			}
			if (name.includes(','))
				return await interaction.reply(
					util.error('`name` must not contain commas.')
				);
			if (price < 0)
				return await interaction.reply(
					util.error('`price` must be 0 or greater.')
				);

			// global optional options
			if (description?.length > 400)
				return await interaction.reply(
					util.error('`description` must be 400 characters or less.')
				);
			if (duration && !ms(duration)) {
				return await interaction.reply(
					util.error(
						'`duration` must be a parseable duration value (5000, 5s, 5m, etc...) and greater than 0.'
					)
				);
			}
			if (stock < 0)
				return await interaction.reply(
					util.error('`stock` must be 0 or greater.')
				);
			if (role_given) {
				if (clientMember.roles.highest.rawPosition <= role_given.rawPosition)
					return await interaction.reply(
						util.error(
							`${role_given} is higher than the bot's highest role and cannot be added.`
						)
					); // role is too high!
				if (role_given.managed)
					return await interaction.reply(
						util.error(
							`${role_given} cannot be a bot role (integration-managed).`
						)
					); // role can't be added
			}
			if (role_removed) {
				if (clientMember.roles.highest.rawPosition <= role_removed.rawPosition)
					return await interaction.reply(
						util.error(
							`${role_removed} is higher than the bot's highest role and cannot be removed.`
						)
					); // role is too high!
				if (role_removed.managed)
					return await interaction.reply(
						util.error(
							`${role_removed} cannot be a bot role (integration-managed).`
						)
					); // role can't be added
			}

			const requiredItemsArray = [];
			if (required_items?.length) {
				for (const item of required_items.split(',')) {
					if (item) {
						const dbItem = await shopItemSchema.findOne({
							guildID: interaction.guild.id,
							name: {
								$regex: new RegExp(item, 'i'),
							},
						});
						if (!dbItem) {
							return await interaction.reply(
								util.error(
									`Could not find item \`${item}\` in shop!\n\n\`required_items\` must be a valid shop item name or list of valid shop item names separated by comma(s) \`,\``
								)
							);
						} else {
							requiredItemsArray.push(dbItem.name);
						}
					}
				}
			}

			if (required_bank && required_bank < price)
				return await interaction.reply(
					util.error(
						`\`required_bank\` must be greater than \`price\` (${price}).`
					)
				);

			if (interaction.options.getSubcommand('generator')) {
				// typeGenerator
				if (generator_period && !ms(generator_amount))
					return await interaction.reply(
						util.error(
							'`generator_period` must be a valid duration value (5000, 5s, 5m, etc...) and greater than 0.'
						)
					);
				if (generator_amount && generator_amount <= 0)
					return await interaction.reply(
						util.error('`generator_amount` must be greater than 0.')
					);
			}

			await new shopItemSchema({
				guildID: interaction.guild.id,
				type: type,
				name: name,
				price: price,
				active: true,
				description: description ?? 'No description.',
				duration: duration ? ms(duration) : null,
				expires: expires,
				stackable: stackable,
				stock: stock,
				rolesGiven: role_given ? [role_given] : [],
				rolesRemoved: role_removed ? [role_removed] : [],
				requiredRoles: required_role ? [required_role] : [],
				requiredItems: required_items ? required_items.split(',') : [],
				requiredBank: required_bank,
				generatorPeriod: generator_period ? ms(generator_period) : null,
				generatorAmount: generator_amount,
			}).save();

			const item = await shopItemSchema.findOne({
				guildID: interaction.guild.id,
				name: {
					$regex: new RegExp(name, 'i'),
				},
			});

			const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);

			const embed = new Discord.MessageEmbed()
				.setColor('GREEN')
				.setAuthor(
					interaction.member.user.tag,
					interaction.member.user.displayAvatarURL()
				)
				.setTitle(`New Item Created — ${item.name}`)
				.setDescription(
					util.cut(item.description, 1000) || 'A very interesting item.'
				)
				.setFooter(`ID: ${item._id}`)
				.addField(
					'Price',
					`${currencySymbol}${
						item.price > 0 ? item.price.toLocaleString() : 'Free'
					}`,
					true
				)
				.addField(
					'Date Created',
					`${new Date(item.createdAt).toLocaleString()}`,
					true
				)
				.addField(
					'Type',
					`${item.type === 'generator' ? 'Generator' : 'Basic'}`,
					false
				)
				.addField(
					'Stock Remaining',
					`${item.stock?.toLocaleString() || 'Infinite'}`,
					true
				)
				.addField(
					'Expires ',
					item.duration
						? `in <t:${
								Date.now() + new Date(item.createdAt).getMilliseconds()
						  }:R>`
						: 'Never',
					true
				)
				.addField(
					'Roles Given',
					`${
						item.rolesGiven?.[0]
							? '<@&' + item.rolesGiven.join('\n<@&') + '>'
							: 'None'
					}`,
					true
				)
				.addField(
					'Role Removed',
					`${
						item.rolesRemoved?.[0]
							? '<@&' + item.rolesRemoved.join('\n<@&') + '>'
							: 'None'
					}`,
					true
				)
				.addField(
					'Role Required',
					`${
						item.requiredRoles?.[0]
							? '<@&' + item.requiredRoles?.join('\n<@&') + '>'
							: 'None'
					}`,
					true
				)
				.addField(
					'Minimum Bank Balance',
					`${currencySymbol}${item.requiredBank?.toLocaleString() ?? '0'}`,
					true
				)
				.addField(
					'Items Required',
					item.requiredItems.length > 0
						? `\`${item.requiredItems?.join('`, `')}\``
						: 'None',
					false
				);

			if (item.type == 'generator') {
				embed
					.addField('Generator Period', `${ms(item.generatorPeriod)}`, true)
					.addField(
						'Generator Amount',
						`${currencySymbol}${item.generatorAmount}`,
						true
					);
			}

			await interaction.reply({
				embeds: [embed],
			});
		} else if (interaction.options.getSubcommand() == 'view') {
			const item = await shopItemSchema.findOne({
				guildID: interaction.guild.id,
				name: {
					$regex: new RegExp(name, 'i'),
				},
			});

			if (!item)
				return await interaction.reply(
					util.error(`No item found with name ${name}`)
				);

			const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);

			const embed = new Discord.MessageEmbed()
				.setColor('BLUE')
				.setAuthor(
					interaction.member.user.tag,
					interaction.member.user.displayAvatarURL()
				)
				.setTitle(
					`${item.name}` + (item.active ? ' `active`' : ' *`deactivated`*')
				)
				.setDescription(item.description || 'A very interesting item.')
				.setFooter(`ID: ${item._id}`)
				.addField(
					'Price',
					`${currencySymbol}${
						item.price > 0 ? item.price.toLocaleString() : 'Free'
					}`,
					true
				)
				.addField(
					'Date Created',
					`${new Date(item.createdAt).toLocaleString()}`,
					true
				)
				.addField(
					'Type',
					`${item.type === 'generator' ? 'Generator' : 'Basic'}`,
					false
				)
				.addField(
					'Stock Remaining',
					`${item.stock?.toLocaleString() || 'Infinite'}`,
					true
				)
				.addField(
					'Expires ',
					item.duration
						? `in <t:${
								Date.now() + new Date(item.createdAt).getMilliseconds()
						  }:R>`
						: 'Never',
					true
				)
				.addField(
					'Roles Given',
					`${
						item.rolesGiven?.[0]
							? '<@&' + item.rolesGiven.join('\n<@&') + '>'
							: 'None'
					}`,
					true
				)
				.addField(
					'Role Removed',
					`${
						item.rolesRemoved?.[0]
							? '<@&' + item.rolesRemoved.join('\n<@&') + '>'
							: 'None'
					}`,
					true
				)
				.addField(
					'Role Required',
					`${
						item.requiredRoles?.[0]
							? '<@&' + item.requiredRoles?.join('\n<@&') + '>'
							: 'None'
					}`,
					true
				)
				.addField(
					'Minimum Bank Balance',
					`${currencySymbol}${item.requiredBank?.toLocaleString() ?? '0'}`,
					true
				)
				.addField(
					'Items Required',
					item.requiredItems.length > 0
						? `\`${item.requiredItems?.join('`, `')}\``
						: 'None',
					false
				);

			if (item.type == 'generator') {
				embed
					.addField('Generator Period', `${ms(item.generatorPeriod)}`, true)
					.addField(
						'Generator Amount',
						`${currencySymbol}${item.generatorAmount}`,
						true
					);
			}

			await interaction.reply({ embeds: [embed] });
		} else if (interaction.options.getSubcommand() == 'deactivate') {
			const econManagerRole = guild.roles.cache.find((r) => {
				return r.name.toLowerCase() === 'economy manager';
			});

			if (!author.roles.cache.has(econManagerRole.id)) {
				return await interaction.reply(
					util.error(
						`You must have the <@&${econManagerRole.id}> role to create items.`
					)
				);
			}

			const item = await shopItemSchema.findOne({
				guildID: interaction.guild.id,
				name: {
					$regex: new RegExp(name, 'i'),
				},
			});
			if (item) {
				await shopItemSchema.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
						name: {
							$regex: new RegExp(name, 'i'),
						},
					},
					{
						active: false,
					}
				);

				let embed = new Discord.MessageEmbed()
					.setColor('GREEN')
					.setAuthor(
						interaction.member.user.tag,
						interaction.member.user.displayAvatarURL()
					)
					.setDescription(
						`Successfully deactivated \`${item.name}\` from the shop.`
					);

				await interaction.reply({ embeds: [embed] });
			} else {
				await interaction.reply(util.error(`Item not found.`));
			}
		} else if (interaction.options.getSubcommand() == 'reactivate') {
			const econManagerRole = guild.roles.cache.find((r) => {
				return r.name.toLowerCase() === 'economy manager';
			});

			if (!author.roles.cache.has(econManagerRole.id)) {
				return await interaction.reply(
					util.error(
						`You must have the <@&${econManagerRole.id}> role to create items.`
					)
				);
			}

			const item = await shopItemSchema.findOne({
				guildID: interaction.guild.id,
				name: {
					$regex: new RegExp(name, 'i'),
				},
			});
			if (item) {
				if (!item.active) {
					await shopItemSchema.findOneAndUpdate(
						{
							guildID: interaction.guild.id,
							name: {
								$regex: new RegExp(name, 'i'),
							},
						},
						{
							active: true,
						}
					);
				} else interaction.reply(util.error(`${item.name} is already active.`));

				let embed = new Discord.MessageEmbed()
					.setColor('GREEN')
					.setAuthor(
						interaction.member.user.tag,
						interaction.member.user.displayAvatarURL()
					)
					.setDescription(
						`Successfully reactivated \`${item.name}\` in the shop.`
					);

				await interaction.reply({ embeds: [embed] });
			} else {
				await interaction.reply(util.error(`Item not found.`));
			}
		} else if (interaction.options.getSubcommand() == 'buy') {
			let item = await shopItemSchema.findOne({
				guildID: interaction.guild.id,
				name: {
					$regex: new RegExp(interaction.options.getString('name'), 'i'),
				},
			});

			if (!item) {
				interaction.reply(util.error("Item doesn't exist"));
				return;
			}

			if (!item.active) {
				await interaction.reply(util.error('This item is no longer active.'));
				return;
			}

			const inventory = await inventorySchema.findOne({
				guildID: interaction.guild.id,
				userID: interaction.member.user.id,
			});

			const inventoryItem = inventory?.inventory.find((item) => {
				return item.name == name;
			});

			const { wallet, total } = await util.getEconInfo(
				interaction.guild.id,
				interaction.member.id
			);

			//Requirement Validation
			if (item.price > wallet) {
				interaction.reply(util.error('You cannot afford this item.'));
				return;
			}

			if (item.requiredRoles.length) {
				for (const role of item.requiredRoles) {
					if (!interaction.member.roles.cache.has(role)) {
						interaction.reply(
							util.error(`You do not have the <@&${role}> role.`)
						);
						return;
					}
				}
			}

			if (item.requiredItems.length) {
				for (const invitem of item.requiredItems) {
					if (!inventory?.inventory.find((i) => i.name === invitem)) {
						interaction.reply(util.error(`You need a(n) \`${invitem}\``));
						return;
					}
				}
			}

			if (item.requiredBalance && total < item.requiredBalance) {
				interaction.reply(
					`Insufficent total\n${item.requiredBalance} required.`
				);
				return;
			}

			//Check if the item is stackable
			if (!item.stackable && inventoryItem) {
				await interaction.reply(
					util.error('This item is unstackable and you already have one!')
				);
				return;
			}

			//If there is a stock, check stock and decrement or deny purchase
			if (item.stock) {
				if (item.stock > 0) {
					await shopItemSchema.findOneAndUpdate(
						{ guildID: interaction.guild.id, name: name },
						{ $inc: { stock: -1 } }
					);
					if (item.stock === 0) {
						await shopItemSchema.findOneAndUpdate(
							{ guildID: interaction.guild.id, name: name },
							{ active: false }
						);
					}
				} else {
					interaction.reply(util.error('This item is out of stock.'));
					return;
				}
			}

			//Add roles given
			if (item.rolesGiven.length) interaction.member.roles.add(item.rolesGiven);

			//Remove roles removed
			if (item.rolesRemoved.length)
				interaction.member.roles.remove(item.rolesRemoved);

			//If user owns item, increment
			//If not, add item to inventory
			if (inventoryItem) {
				await inventorySchema.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
						userID: interaction.member.id,
						'inventory.ref': inventoryItem.ref,
					},
					{ $inc: { 'inventory.$.amount': 1 } },
					{ new: true, upsert: true }
				);
			} else {
				await inventorySchema.findOneAndUpdate(
					{ guildID: interaction.guild.id, userID: interaction.member.id },
					{ $push: { inventory: { name: item.name, amount: 1 } } },
					{ new: true, upsert: true }
				);
			}

			await util.transaction(
				interaction.guild.id,
				interaction.member.id,
				'PURCHASE_SHOP_ITEM',
				`Purchased ${item.name}`,
				-item.price,
				0,
				-item.price
			);

			await interaction.reply(util.success(`You bought \`${item.name}\``));
		}
	},
};
