import { GuildMemberRoleManager, Role } from 'discord.js';
import ms from 'ms';

import { getEconInfo, itemInfo, itemRegExp, transaction } from '../../lib';
import { MemberModel, Shop, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { Types } from 'mongoose';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('create-item')
		.setDescription('Add a new item to the guild shop!')
		.setAuthority('MANAGER')
		.setFormat('<classic | generator> <name, price> [<generator_period, generator_amount>] [...optional params]')
		.setExamples(['classic <name: Role I> <price: 150> [roles_given: @VIP]', 'classic <name: Role II> <price: 500> [roles_required: @VIP] [roles_given: @VIP+]', 'generator <name: Factory I> <price: 1000> <generator_amount: 50> <generator_period: 1h>', 'generator <name: Factory II> <price: 2000> <generator_amount: 100> <generator_period: 1h> [required_items: Factory I]'])
		.setModule('SHOP')
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('classic')
				.setDescription('Blueprint for a simple shop item.')
				.setFormat('<name> <price> [...optional params]')
				.addStringOption((option) =>
					option
						.setName('name')
						.setDescription('The name of the item.')
						.setRequired(true)
				)
				.addNumberOption((options) =>
					options
						.setName('price')
						.setDescription('How much it will cost users to obtain this item.')
						.setRequired(true)
				)
				.addStringOption((options) =>
					options
						.setName('usability')
						.setDescription('The item\'s inventory behavior.')
						.addChoices([
							['Instant - item is used on purchase and is not stored in inventory.', 'Instant'],
							['Usable - item is stored in inventory and removed upon /use.', 'Usable'],
							['Unusable - item is stored in inventory and can\'t be /use(d).', 'Unusable']
						])
						.setRequired(true)
				)
				.addStringOption((options) =>
					options
						.setName('description')
						.setDescription('The description of the item')
				)
				.addNumberOption((options) =>
					options
						.setName('required_treasury')
						.setDescription('The treasury balance required to purchase the item.')
				)
				.addStringOption((options) =>
					options
						.setName('required_roles')
						.setDescription('Roles required for purchase. @Role1, @Role2, @...')
				)
				.addStringOption((options) =>
					options
						.setName('required_items')
						.setDescription('Items required for purchase. ItemName1, ItemName2, ...')
				)
				.addIntegerOption((options) =>
					options
						.setName('stock')
						.setDescription('How much of this item is available to be purchased.')
				)
				.addStringOption((options) =>
					options
						.setName('duration')
						.setDescription('How long this item will stay in the shop')
				)
				.addStringOption((options) =>
					options
						.setName('roles_given')
						.setDescription('Roles given to the purchaser. @Role1, @Role2, @...')
				)
				.addStringOption((options) =>
					options
						.setName('roles_removed')
						.setDescription('Roles removed from the purchases. @Role1, @Role2, @...')
				)
				.addBooleanOption((options) =>
					options
						.setName('stackable')
						.setDescription('Does this item stack in inventory?')
				)
				.addBooleanOption((options) =>
					options
						.setName('active')
						.setDescription('Is this item active in the shop.')
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('generator')
				.setDescription('Blueprint for a generator shop item.')
				.setFormat('<name> <price> <generator_period> <generator_amount> [...optional params]')
				.addStringOption((option) =>
					option
						.setName('name')
						.setDescription('The name of the item.')
						.setRequired(true)
				)
				.addNumberOption((options) =>
					options
						.setName('price')
						.setDescription('How much it will cost users to obtain this item.')
						.setRequired(true)
				)
				.addNumberOption((options) =>
						options
							.setName('generator_amount')
							.setDescription('Amount the generator owner will receive per generator period.')
							.setRequired(true)
				)
				.addStringOption((options) =>
						options
							.setName('generator_period')
							.setDescription('How often the generator owner will earn `generator_amount`.')
							.setRequired(true)
				)
				.addStringOption((options) =>
					options
						.setName('usability')
						.setDescription('The item\'s inventory behavior.')
						.addChoices([
							['Instant - item is used on purchase and is not stored in inventory.', 'Instant'],
							['Usable - item is stored in inventory and removed upon /use.', 'Usable'],
							['Unusable - item is stored in inventory and can\'t be /use(d)', 'Unusable']
						])
						.setRequired(true)
				)
				.addStringOption((options) =>
					options
						.setName('description')
						.setDescription('The description of the item')
				)
				.addNumberOption((options) =>
					options
						.setName('required_treasury')
						.setDescription('The treasury balance required to purchase the item.')
				)
				.addStringOption((options) =>
					options
						.setName('required_roles')
						.setDescription('Roles required for purchase. @Role1, @Role2, @...')
				)
				.addStringOption((options) =>
					options
						.setName('required_items')
						.setDescription('Items required for purchase. ItemName1, ItemName2, ...')
				)
				.addIntegerOption((options) =>
					options
						.setName('stock')
						.setDescription('How much of this item is available to be purchased.')
				)
				.addStringOption((options) =>
					options
						.setName('duration')
						.setDescription('How long this item will stay in the shop')
				)
				.addStringOption((options) =>
					options
						.setName('roles_given')
						.setDescription('Roles given to the purchaser. @Role1, @Role2, @...')
				)
				.addStringOption((options) =>
					options
						.setName('roles_removed')
						.setDescription('Roles removed from the purchases. @Role1, @Role2, @...')
				)
				.addBooleanOption((options) =>
					options
						.setName('stackable')
						.setDescription('Does this item stack in inventory?')
				)
				.addBooleanOption((options) =>
					options
						.setName('active')
						.setDescription('Is this item active in the shop.')
				)
		)

	execute = async (ctx: Context) => {
		const { interaction, guildDocument } = ctx;
		const { currency } = guildDocument;
		const subcommand = interaction.options.getSubcommand();

		// Checks and formatting.
		const sameNameItem = await ShopModel.findOne({
			guild: ctx.guildDocument,
			name: itemRegExp(interaction.options.getString('name'))
		})
		if (sameNameItem)
			return ctx.embedify('error', 'user', `An item with name \`${sameNameItem.name}\` already exists. You can use the \`delete-item\` command to delete it.`, true);
		if (interaction.options.getNumber('price') < 0)
			return ctx.embedify('error', 'user', 'Item price cannot be less than 0.', true);
		if (interaction.options.getString('description')?.length > 250)
			return ctx.embedify('error', 'user', 'Item description cannot be more than 250 characters.', true);
		if (interaction.options.getNumber('required_treasury') < 0)
			return ctx.embedify('error', 'user', 'Required treasury balance cannot be less than 0.', true);

		const duration = interaction.options.getString('duration')
		let numDuration: number
		if (duration) {
			
			numDuration = ms(duration) ?? parseInt(duration)

			if (!duration)
				return ctx.embedify('error', 'user', `\`${interaction.options.getString('duration')}\` is not a parseable duration value.\n\nExample: 10000, 10s, 10m, 10h, 10d.`, true)
		}

		if (numDuration < 0)
			return ctx.embedify('error', 'user', 'Item duration cannot be less than zero.', true);
		if (interaction.options.getInteger('stock') < 0)
			return ctx.embedify('error', 'user', 'Item stock cannot be less than 0.', true);

		const requiredRolesIds = interaction.options.getString('required_roles')?.split(',')
		const requiredRoles: string[] = []

		requiredRolesIds?.forEach(rId => {
			const role = interaction.guild.roles.cache.find(r => rId.includes(r.id))

			if (!role)
				return ctx.embedify('error', 'user', `The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true)

			requiredRoles.push(role.id)
		})

		const rolesGivenIds = interaction.options.getString('roles_given')?.split(',')
		const rolesGiven: string[] = []

		rolesGivenIds?.forEach(rId => {
			const role = interaction.guild.roles.cache.find(r => rId.includes(r.id))

			if (!role)
				return ctx.embedify('error', 'user', `The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true)

			rolesGiven.push(role.id)
		})

		const rolesRemovedIds = interaction.options.getString('roles_removed')?.split(',')
		const rolesRemoved: string[] = []

		rolesRemovedIds?.forEach(rId => {
			const role = interaction.guild.roles.cache.find(r => rId.includes(r.id))

			if (!role)
				return ctx.embedify('error', 'user', `The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true)

			rolesRemoved.push(role.id)
		})

		const requiredItemsUF = interaction.options.getString('required_items')?.split(',')
		const requiredItems: Types.DocumentArray<Shop> = new Types.DocumentArray<Shop>([])

		const items = await ShopModel.find({
			guild: ctx.guildDocument
		})

		requiredItemsUF?.forEach(iName => {
			const item = items.find(item => item.name.toLowerCase() == iName.trim().toLowerCase())

			if (!item)
				return ctx.embedify('error', 'user', `The string ${iName} could not be parsed as an inventory item, or an item with such name does not exist. Please pass a list of inventory item names (case-insensitive) separated by commas for \`required_items\`.`, true)

			requiredItems.push(item)
		})

		let item = null;
		if (subcommand == 'classic')
			item = await ShopModel.create({
				guild: ctx.guildDocument,
				type: 'ITEM',
				name: interaction.options.getString('name'),
				price: interaction.options.getNumber('price'),
				usability: interaction.options.getString('usability'),
				treasuryRequired: interaction.options.getNumber('required_treasury') ?? 0,
				active: interaction.options.getBoolean('active') ?? true,
				description: interaction.options.getString('description') ?? 'A very interesting item.',
				duration: numDuration ?? Number.POSITIVE_INFINITY,
				stackable: interaction.options.getBoolean('stackable') ?? true,
				stock: interaction.options.getInteger('stock') ?? Number.POSITIVE_INFINITY,
				rolesGiven,
				rolesRemoved,
				requiredRoles,
				requiredItems,
				createdAt: Date.now()
			})

		else if (subcommand == 'generator') {
			const generatorPeriod = ms(interaction.options.getString('generator_period')) ?? parseInt(interaction.options.getString('generator_period'))
			
			if (!generatorPeriod)
				return ctx.embedify('error', 'user', `\`${interaction.options.getString('generatorPeriod')}\` is not a parseable duration value.\n\nExample: 10000, 10s, 10m, 10h, 10d.`, true)
			
			if (generatorPeriod < 10000)
				return ctx.embedify('error', 'user', `\`generator_period\` can't be less than 10 seconds!`, true)

			item = await ShopModel.create({
				guild: ctx.guildDocument,
				type: 'GENERATOR',
				name: interaction.options.getString('name'),
				price: interaction.options.getNumber('price'),
				usability: interaction.options.getString('usability'),
				treasuryRequired: interaction.options.getNumber('required_treasury') ?? 0,
				active: interaction.options.getBoolean('active') ?? true,
				description: interaction.options.getString('description') ?? 'A very interesting item.',
				duration: numDuration ?? Number.POSITIVE_INFINITY,
				stackable: interaction.options.getBoolean('stackable') ?? true,
				stock: interaction.options.getInteger('stock') ?? Number.POSITIVE_INFINITY,
				rolesGiven,
				rolesRemoved,
				requiredRoles,
				requiredItems,
				createdAt: Date.now(),
				generatorPeriod,
				generator_amount: interaction.options.getNumber('generator_amount')
			})
		}

		return await ctx.interaction.reply({
			embeds: [await itemInfo(ctx, item)]
		});
	}
}