import { Message } from "discord.js";
import ms from "ms";
import { itemInfo, itemRegExp } from "../../lib";
import { Shop, ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";
import { Document, LeanDocument, Types } from 'mongoose';


export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('edit-item')
		.setDescription('Edit properties of an item. Some properties are unchangeable.')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('classic')
				.setDescription('Modify a type-classic item in the shop.')
				.addStringOption((options) =>
					options
						.setName('edit-mode')
						.setDescription('How your changes will be applied to the item.')
						.addChoices([
							['Layered - Only change the passed options.', 'layered'],
							['Replace - Only change the passed options AND reset others to global defaults.', 'replace']
						])
						.setRequired(true)
				)
				.addStringOption((options) =>
					options
						.setName('name')
						.setDescription('The name of the item to find to edit. This does not change the name.')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('new_name')
						.setDescription('The new name of the item to change it to.')
				)
				.addNumberOption((options) =>
					options
						.setName('price')
						.setDescription('How much it will cost users to obtain this item.')
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
				.setDescription('Modify a type-generator item in the shop.')
				.addStringOption((options) =>
					options
						.setName('edit-mode')
						.setDescription('How your changes will be applied to the item.')
						.addChoices([
							['Layered - Only change the passed options.', 'layered'],
							['Replace - Only change the passed options AND reset others to global defaults.', 'replace']
						])
						.setRequired(true)
				)
				.addStringOption((options) =>
					options
						.setName('name')
						.setDescription('The name of the item to find to edit. This does not change the name.')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('new_name')
						.setDescription('The new name of the item to change it to.')
				)
				.addNumberOption((options) =>
					options
						.setName('price')
						.setDescription('How much it will cost users to obtain this item.')
				)
				.addNumberOption((options) =>
					options
						.setName('generator_amount')
						.setDescription('Amount the generator owner will receive per generator period.')
				)
				.addStringOption((options) =>
					options
						.setName('generator_period')
						.setDescription('How often the generator owner will earn `generator_amount`.')
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

	public execute = async (ctx: Context) => {
		const { interaction } = ctx;
		const subcommand = interaction.options.getSubcommand();
		const edit_mode = interaction.options.getString('edit-mode');


		// There's no item, dumbass
		if (!
			await ShopModel.findOne({
				guild: ctx.guildDocument,
				name: itemRegExp(interaction.options.getString('name'))
			})
		) return await ctx.embedify('error', 'user', `No item with name \`${interaction.options.getString('name')}\` found.`, true)

		if (edit_mode == 'replace') {
			const missingRequiredArgs: string[] = []

			if (!interaction.options.getString('new_name'))
				missingRequiredArgs.push('new_name')
			if (!interaction.options.getString('price'))
				missingRequiredArgs.push('price')
			if (!interaction.options.getString('usability'))
				missingRequiredArgs.push('usability')

			if (subcommand == 'generator') {
				if (!interaction.options.getNumber('generator_amount'))
					missingRequiredArgs.push('generator_amount')
				if (!interaction.options.getString('generator_period'))
					missingRequiredArgs.push('generator_period')
			}

			if (missingRequiredArgs.length)
				return await ctx.embedify('error', 'user', `\`${missingRequiredArgs.join('`, `')}\` are required arguments for **edit-item ${subcommand}** with the \`edit-mode\` set as \`Layered\`.\n\nPlease provide a value for these.`, true)
		}

		let editedItem: any = {}

		// Checks and formatting.
		const sameNameItem = await ShopModel.findOne({
			guild: ctx.guildDocument,
			name: itemRegExp(interaction.options.getString('new_name'))
		})
		if (sameNameItem)
			return ctx.embedify('error', 'user', `An item with name \`${sameNameItem.name}\` already exists. You can use the \`delete-item\` command to delete it.`, true);
		else if (interaction.options.getString('new_name') == 'all')
			return ctx.embedify('error', 'user', 'Item name cannot be `all` as it is a reserved query.', true)
		else if (interaction.options.getString('new_name')?.indexOf(',') >= 0)
			return ctx.embedify('error', 'user', 'Item name cannot include commas `,` as they would interfere with arguments that involve listing item names.', true)
		else if (interaction.options.getString('new_name'))
			editedItem['name'] = interaction.options.getString('new_name')

		if (interaction.options.getNumber('price') && interaction.options.getNumber('price') < 0)
			return ctx.embedify('error', 'user', 'Item price cannot be less than 0.', true);
		else if (interaction.options.getNumber('price'))
			editedItem['price'] = interaction.options.getNumber('price')

		if (interaction.options.getString('description')?.length > 250)
			return ctx.embedify('error', 'user', 'Item description cannot be more than 250 characters.', true);
		else if (interaction.options.getString('description'))
			editedItem['descriptions'] = interaction.options.getString('description')

		if (interaction.options.getNumber('required_treasury') < 0)
			return ctx.embedify('error', 'user', 'Required treasury balance cannot be less than 0.', true);
		else editedItem['required_treasury'] = interaction.options.getNumber('required_treasuru')

		const duration = interaction.options.getString('duration')
		let numDuration: number
		if (duration) {

			numDuration = ms(duration) ?? parseInt(duration)

			if (!duration)
				return ctx.embedify('error', 'user', `\`${interaction.options.getString('duration')}\` is not a parseable duration value.\n\nExample: 10000, 10s, 10m, 10h, 10d.`, true)
		}

		if (numDuration < 0)
			return ctx.embedify('error', 'user', 'Item duration cannot be less than zero.', true);
		else editedItem['duration'] = duration

		if (interaction.options.getInteger('stock') < 0)
			return ctx.embedify('error', 'user', 'Item stock cannot be less than 0.', true);
		else editedItem['stock'] = interaction.options.getInteger('stock')

		const requiredRolesIds = interaction.options.getString('required_roles')?.split(',')
		const requiredRoles: string[] = []

		requiredRolesIds?.forEach(rId => {
			const role = interaction.guild.roles.cache.find(r => rId.includes(r.id))

			if (!role)
				return ctx.embedify('error', 'user', `The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true)

			requiredRoles.push(role.id)
		})
		editedItem['requiredRoles'] = requiredRoles

		const rolesGivenIds = interaction.options.getString('roles_given')?.split(',')
		const rolesGiven: string[] = []

		rolesGivenIds?.forEach(rId => {
			const role = interaction.guild.roles.cache.find(r => rId.includes(r.id))

			if (!role)
				return ctx.embedify('error', 'user', `The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true)

			rolesGiven.push(role.id)
		})
		editedItem['rolesGiven'] = rolesGiven

		const rolesRemovedIds = interaction.options.getString('roles_removed')?.split(',')
		const rolesRemoved: string[] = []

		rolesRemovedIds?.forEach(rId => {
			const role = interaction.guild.roles.cache.find(r => rId.includes(r.id))

			if (!role)
				return ctx.embedify('error', 'user', `The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true)

			rolesRemoved.push(role.id)
		})
		editedItem['rolesRemoved'] = rolesRemoved

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
		editedItem['requiredItems'] = requiredItems

		let generatorPeriod: number;
		if (subcommand == 'generator') {
			if (interaction.options.getString('generator_period')) {
				generatorPeriod = ms(interaction.options.getString('generator_period')) ?? parseInt(interaction.options.getString('generator_period'))

				if (!generatorPeriod)
					return ctx.embedify('error', 'user', `\`${interaction.options.getString('generatorPeriod')}\` is not a parseable duration value.\n\nExample: 10000, 10s, 10m, 10h, 10d.`, true)

				if (generatorPeriod < 10000)
					return ctx.embedify('error', 'user', `\`generator_period\` can't be less than 10 seconds!`, true)
			}
			editedItem['generatorPeriod'] = generatorPeriod
		}

		if (edit_mode == 'layered') {
			Object.keys(editedItem).forEach(key => {
				if (!editedItem[key] || (Array.isArray(editedItem[key]) && !editedItem[key]?.length))
					delete editedItem[key];
			})


			await ShopModel.findOneAndUpdate({
				guild: ctx.guildDocument,
				name: itemRegExp(interaction.options.getString('name'))
			}, editedItem)
		}
		else if (edit_mode == 'replace') {
			if (subcommand == 'classic') {
				await ShopModel.findOneAndUpdate({
					guild: ctx.guildDocument,
					name: itemRegExp(interaction.options.getString('name'))
				}, {
					name: interaction.options.getString('new_name'),
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
					requiredItems
				})
			}
			else if (subcommand == 'generator') {
				await ShopModel.findOneAndUpdate({
					guild: ctx.guildDocument,
					name: itemRegExp(interaction.options.getString('name'))
				}, {
					name: interaction.options.getString('new_name'),
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
					generatorPeriod,
					generatorAmount: interaction.options.getNumber('generator_amount')
				})
			}
		}


		const item = await ShopModel.findOne({
			guild: ctx.guildDocument,
			name: itemRegExp(interaction.options.getString('new_name') || interaction.options.getString('name'))
		})

		return await ctx.interaction.reply({
			embeds: [(await itemInfo(ctx, item)).setFooter({
				text: `Edit for the following was successful: ${Object.keys(editedItem).join(', ') || 'Nothing was changed'}.`
			})]
		});
	}
}