import mongoose from 'mongoose';
import ms from 'ms';

import { displayListing, itemRegExp } from '../../lib/index.js';
import { Listing, ListingModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	data = new EconomicaSlashCommandBuilder()
		.setName('edit-item')
		.setDescription('Edit properties of an item')
		.setModule('SHOP')
		.setFormat('edit-item <classic | generator> [..arguments]')
		.setExamples(['edit-item classic name: Bike new_name: Bicycle'])
		.setAuthority('MANAGER')
		.addSubcommand((subcommand) => subcommand
			.setName('classic')
			.setDescription('Modify a type-classic item in the shop')
			.addStringOption((options) => options
				.setName('edit-mode')
				.setDescription('How your changes will be applied to the item')
				.addChoices([
					['Layered - Only change the passed options', 'layered'],
					['Replace - Only change the passed options AND reset others to global defaults', 'replace'],
				])
				.setRequired(true))
			.addStringOption((options) => options
				.setName('name')
				.setDescription('Specify the item')
				.setRequired(true))
			.addStringOption((option) => option.setName('new_name').setDescription('The new name of the item to change it to'))
			.addNumberOption((options) => options.setName('price').setDescription('How much it will cost users to obtain this item'))
			.addStringOption((options) => options
				.setName('usability')
				.setDescription("The item's inventory behavior.")
				.addChoices([
					['Instant - item is used on purchase and is not stored in inventory.', 'Instant'],
					['Usable - item is stored in inventory and removed upon /use.', 'Usable'],
					["Unusable - item is stored in inventory and can't be /use(d).", 'Unusable'],
				]))
			.addStringOption((options) => options.setName('description').setDescription('The description of the item'))
			.addNumberOption((options) => options.setName('required_treasury').setDescription('The treasury balance required to purchase the item.'))
			.addStringOption((options) => options.setName('required_roles').setDescription('Roles required for purchase. @Role1, @Role2, @...'))
			.addStringOption((options) => options.setName('required_items').setDescription('Items required for purchase. ItemName1, ItemName2, ...'))
			.addIntegerOption((options) => options.setName('stock').setDescription('How much of this item is available to be purchased.'))
			.addStringOption((options) => options.setName('duration').setDescription('How long this item will stay in the shop'))
			.addStringOption((options) => options.setName('roles_given').setDescription('Roles given to the purchaser. @Role1, @Role2, @...'))
			.addStringOption((options) => options.setName('roles_removed').setDescription('Roles removed from the purchases. @Role1, @Role2, @...'))
			.addBooleanOption((options) => options.setName('stackable').setDescription('Does this item stack in inventory?'))
			.addBooleanOption((options) => options.setName('active').setDescription('Is this item active in the shop.')))
		.addSubcommand((subcommand) => subcommand
			.setName('generator')
			.setDescription('Modify a type-generator item in the shop.')
			.addStringOption((options) => options
				.setName('edit-mode')
				.setDescription('How your changes will be applied to the item.')
				.addChoices([
					['Layered - Only change the passed options.', 'layered'],
					['Replace - Only change the passed options AND reset others to global defaults.', 'replace'],
				])
				.setRequired(true))
			.addStringOption((options) => options
				.setName('name')
				.setDescription('The name of the item to find to edit. This does not change the name.')
				.setRequired(true))
			.addStringOption((option) => option.setName('new_name').setDescription('The new name of the item to change it to.'))
			.addNumberOption((options) => options.setName('price').setDescription('How much it will cost users to obtain this item.'))
			.addNumberOption((options) => options
				.setName('generator_amount')
				.setDescription('Amount the generator owner will receive per generator period.'))
			.addStringOption((options) => options
				.setName('generator_period')
				.setDescription('How often the generator owner will earn `generator_amount`.'))
			.addStringOption((options) => options
				.setName('usability')
				.setDescription("The item's inventory behavior.")
				.addChoices([
					['Instant - item is used on purchase and is not stored in inventory.', 'Instant'],
					['Usable - item is stored in inventory and removed upon /use.', 'Usable'],
					["Unusable - item is stored in inventory and can't be /use(d).", 'Unusable'],
				]))
			.addStringOption((options) => options.setName('description').setDescription('The description of the item'))
			.addNumberOption((options) => options.setName('required_treasury').setDescription('The treasury balance required to purchase the item.'))
			.addStringOption((options) => options.setName('required_roles').setDescription('Roles required for purchase. @Role1, @Role2, @...'))
			.addStringOption((options) => options.setName('required_items').setDescription('Items required for purchase. ItemName1, ItemName2, ...'))
			.addIntegerOption((options) => options.setName('stock').setDescription('How much of this item is available to be purchased.'))
			.addStringOption((options) => options.setName('duration').setDescription('How long this item will stay in the shop'))
			.addStringOption((options) => options.setName('roles_given').setDescription('Roles given to the purchaser. @Role1, @Role2, @...'))
			.addStringOption((options) => options.setName('roles_removed').setDescription('Roles removed from the purchases. @Role1, @Role2, @...'))
			.addBooleanOption((options) => options.setName('stackable').setDescription('Does this item stack in inventory?'))
			.addBooleanOption((options) => options.setName('active').setDescription('Is this item active in the shop.')));

	public execute = async (ctx: Context) => {
		const { interaction } = ctx;
		const subcommand = interaction.options.getSubcommand();
		const edit_mode = interaction.options.getString('edit-mode');
		if (!(await ListingModel.findOne({ guild: ctx.guildDocument, name: interaction.options.getString('name') }))) {
			ctx.embedify('error', 'user', `No item with name \`${interaction.options.getString('name')}\` found.`, true);
			return;
		}

		if (edit_mode === 'replace') {
			const missingRequiredArgs: string[] = [];

			if (!interaction.options.getString('new_name')) missingRequiredArgs.push('new_name');
			if (!interaction.options.getString('price')) missingRequiredArgs.push('price');
			if (!interaction.options.getString('usability')) missingRequiredArgs.push('usability');

			if (subcommand === 'generator') {
				if (!interaction.options.getNumber('generator_amount')) missingRequiredArgs.push('generator_amount');
				if (!interaction.options.getString('generator_period')) missingRequiredArgs.push('generator_period');
			}

			if (missingRequiredArgs.length) {
				ctx.embedify('error', 'user', `\`${missingRequiredArgs.join('`, `')}\` are required arguments for **edit-item ${subcommand}** with the \`edit-mode\` set as \`Layered\`.\n\nPlease provide a value for these.`, true);
				return;
			}
		}

		let editedItem: Listing;
		// Checks and formatting.
		const sameNameItem = await ListingModel.findOne({ guild: ctx.guildDocument, name: itemRegExp(interaction.options.getString('new_name')) });
		if (sameNameItem) ctx.embedify('error', 'user', `An item with name \`${sameNameItem.name}\` already exists. You can use the \`delete-item\` command to delete it.`, true);
		if (interaction.options.getString('new_name') === 'all') ctx.embedify('error', 'user', 'Item name cannot be `all` as it is a reserved query.', true);
		if (interaction.options.getString('new_name')?.indexOf(',') >= 0) ctx.embedify('error', 'user', 'Item name cannot include commas `,` as they would interfere with arguments that involve listing item names.', true);
		if (interaction.options.getString('new_name')) editedItem.name = interaction.options.getString('new_name');
		if (interaction.options.getNumber('price') && interaction.options.getNumber('price') < 0) ctx.embedify('error', 'user', 'Item price cannot be less than 0.', true);
		if (interaction.options.getNumber('price')) editedItem.price = interaction.options.getNumber('price');
		if (interaction.options.getString('description')?.length > 250) ctx.embedify('error', 'user', 'Item description cannot be more than 250 characters.', true);
		if (interaction.options.getString('description')) editedItem.description = interaction.options.getString('description');
		if (interaction.options.getNumber('required_treasury') < 0) ctx.embedify('error', 'user', 'Required treasury balance cannot be less than 0.', true);
		editedItem.requiredTreasury = interaction.options.getNumber('required_treasury');

		const duration = interaction.options.getString('duration');
		let numDuration: number;
		if (duration) {
			numDuration = ms(duration);

			if (!duration) {
				ctx.embedify('error', 'user', `\`${duration}\` is not a parseable duration value.\n\nExample: 10000, 10s, 10m, 10h, 10d.`, true);
				return;
			}
		}

		if (numDuration < 0) {
			ctx.embedify('error', 'user', 'Item duration cannot be less than zero.', true);
			return;
		}
		editedItem.duration = numDuration;

		if (interaction.options.getInteger('stock') < 0) {
			ctx.embedify('error', 'user', 'Item stock cannot be less than 0.', true);
			return;
		}
		editedItem.stock = interaction.options.getInteger('stock');

		const requiredRolesIds = interaction.options.getString('required_roles')?.split(',');
		const requiredRoles: string[] = [];
		requiredRolesIds.forEach((id) => {
			const role = interaction.guild.roles.cache.find((r) => id.includes(r.id));
			if (!role) {
				ctx.embedify('error', 'user', `The string ${id} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true);
			}
			if (ctx.interaction.replied) return;

			requiredRoles.push(role.id);
		});

		editedItem.requiredRoles = requiredRoles;

		const rolesGivenIds = interaction.options.getString('roles_given')?.split(',');
		const rolesGiven: string[] = [];
		rolesGivenIds.forEach((id) => {
			const role = interaction.guild.roles.cache.find((r) => id.includes(r.id));

			if (!role) {
				ctx.embedify(
					'error',
					'user',
					`The string ${id} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`,
					true,
				);
			}

			rolesGiven.push(role.id);
		});
		if (ctx.interaction.replied) return;

		editedItem.rolesGiven = rolesGiven;

		const rolesRemovedIds = interaction.options.getString('roles_removed')?.split(',');
		const rolesRemoved: string[] = [];
		rolesRemovedIds.forEach((id) => {
			const role = interaction.guild.roles.cache.find((r) => id.includes(r.id));

			if (!role) {
				ctx.embedify(
					'error',
					'user',
					`The string ${id} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`,
					true,
				);
			}

			rolesRemoved.push(role.id);
		});
		if (ctx.interaction.replied) return;

		editedItem.rolesRemoved = rolesRemoved;

		const requiredItemsUF = interaction.options.getString('required_items')?.split(',');
		const requiredItems = new mongoose.Types.DocumentArray<Listing>([]);

		const items = await ListingModel.find({
			guild: ctx.guildDocument,
		});

		requiredItemsUF.forEach((name) => {
			const item = items.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());

			if (!item) {
				ctx.embedify(
					'error',
					'user',
					`The string ${name} could not be parsed as an inventory item, or an item with such name does not exist. Please pass a list of inventory item names (case-insensitive) separated by commas for \`required_items\`.`,
					true,
				);
			}

			requiredItems.push(item);
		});
		if (ctx.interaction.replied) return;

		editedItem.requiredItems = requiredItems;

		let generatorPeriod: number;
		if (subcommand === 'generator') {
			generatorPeriod = ms(interaction.options.getString('generator_period'));
			if (!generatorPeriod) {
				ctx.embedify(
					'error',
					'user',
					`\`${interaction.options.getString(
						'generatorPeriod',
					)}\` is not a parseable duration value.\n\nExample: 10000, 10s, 10m, 10h, 10d.`,
					true,
				);
			}

			if (generatorPeriod < 10000) ctx.embedify('error', 'user', '`generator_period` can\'t be less than 10 seconds!', true);
		}

		if (ctx.interaction.replied) return;

		if (edit_mode === 'layered') {
			Object.keys(editedItem).forEach((key) => {
				if (!editedItem[key] || !editedItem[key]?.length) delete editedItem[key];
			});

			await ListingModel.findOneAndUpdate(
				{
					guild: ctx.guildDocument,
					name: interaction.options.getString('name'),
				},
				editedItem,
			);
		} else if (edit_mode === 'replace') {
			if (subcommand === 'classic') {
				await ListingModel.findOneAndUpdate(
					{
						guild: ctx.guildDocument,
						name: interaction.options.getString('name'),
					},
					{
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
					},
				);
			} else if (subcommand === 'generator') {
				await ListingModel.findOneAndUpdate(
					{
						guild: ctx.guildDocument,
						name: interaction.options.getString('name'),
					},
					{
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
						generator_amount: interaction.options.getNumber('generator_amount'),
					},
				);
			}
		}

		const listing = await ListingModel.findOne({
			guild: ctx.guildDocument,
			name: interaction.options.getString('new_name'),
		});

		await displayListing(ctx, listing);
	};
}
