import ms from 'ms';

import { ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('create-item')
		.setDescription('Add a new item to the guild shop!')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('classic')
				.setDescription('Blueprint for a simple shop item.')
				.setFormat('<name> <price> [...optional params]')
				.addStringOption((option) => option.setName('name').setDescription('The name of the item.').setRequired(true))
				.addNumberOption((options) =>
					options.setName('price').setDescription('How much it will cost users to obtain this item.').setRequired(true)
				)
				.addStringOption((options) => options.setName('description').setDescription('The description of the item'))
				.addNumberOption((options) =>
					options.setName('required_treasury').setDescription('The treasury balance required to purchase the item.')
				)
				.addStringOption((options) =>
					options.setName('required_roles').setDescription('Roles required for purchase. @Role1, @Role2, @...')
				)
				.addStringOption((options) =>
					options.setName('required_items').setDescription('Items required for purchase. ItemName1, ItemName2, ...')
				)
				.addIntegerOption((options) =>
					options.setName('stock').setDescription('How much of this item is available to be purchased.')
				)
				.addStringOption((options) =>
					options.setName('duration').setDescription('How long this item will stay in the shop')
				)
				.addStringOption((options) =>
					options.setName('roles_given').setDescription('Roles given to the purchaser. @Role1, @Role2, @...')
				)
				.addStringOption((options) =>
					options.setName('roles_removed').setDescription('Roles removed from the purchases. @Role1, @Role2, @...')
				)
				.addBooleanOption((options) =>
					options.setName('stackable').setDescription('Does this item stack in inventory?')
				)
				.addBooleanOption((options) => options.setName('active').setDescription('Is this item active in the shop.'))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('generator')
				.setDescription('Blueprint for a generator shop item.')
				.setFormat('<name> <price> <generator_period> <generator_amount> [...optional params]')
				.addStringOption((options) => options.setName('name').setDescription('The name of the item.').setRequired(true))
				.addNumberOption((options) =>
					options.setName('price').setDescription('How much it will cost users to obtain this item.').setRequired(true)
				)
		);

	public execute = async (ctx: Context) => {
		const { interaction, guildDocument } = ctx;
		const { currency } = guildDocument;
		const subcommand = interaction.options.getSubcommand();
		const name = interaction.options.getString('name');
		const rawDuration = interaction.options.getString('duration');

		// Checks and formatting.
		const shop = await ShopModel.findOne({
			guild: ctx.guildDocument._id,
			name: new RegExp(name, 'i'),
		});

		if (shop) {
			// prettier-ignore
			return ctx.embedify('error', 'user', `An item with name \`${shop.name}\` already exists. You can use the \`delete-item\` command to delete it.`, true);
		} else if (interaction.options.getNumber('price') < 0) {
			return ctx.embedify('error', 'user', 'Item price cannot be less than 0.', true);
		} else if (interaction.options.getString('description')?.length > 250) {
			return ctx.embedify('error', 'user', 'Item description cannot be more than 250 characters.', true);
		} else if (interaction.options.getNumber('required_treasury') < 0) {
			return ctx.embedify('error', 'user', 'Required treasury balance cannot be less than 0.', true);
		}

		let formattedDuration;
		if (rawDuration) {
			formattedDuration = ms(rawDuration);
			if (!formattedDuration)
				// prettier-ignore
				return ctx.embedify('error', 'user', `\`${rawDuration}\` is not a parseable duration value.\n\nExample: 10000, 10s, 10m, 10h, 10d.`, true);
		}

		if (formattedDuration < 0) return ctx.embedify('error', 'user', 'Item duration cannot be less than zero.', true);
		if (interaction.options.getInteger('stock') < 0)
			return ctx.embedify('error', 'user', 'Item stock cannot be less than 0.', true);

		const requiredRolesIds = interaction.options.getString('required_roles')?.replaceAll(' ', '').split('><');
		const requiredRoles: string[] = [];

		requiredRolesIds?.forEach((rId) => {
			const role = interaction.guild.roles.cache.find((r) => rId.includes(r.id));
			if (!role) {
				// prettier-ignore
				return ctx.embedify('error', 'user', `The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`, true);
			}

			requiredRoles.push(role.id);
		});

		const rolesGivenIds = interaction.options.getString('roles_given')?.split(',');
		const rolesGiven: string[] = [];

		rolesGivenIds?.forEach((rId) => {
			const role = interaction.guild.roles.cache.find((r) => rId.includes(r.id));
			if (!role)
				return ctx.embedify(
					'error',
					'user',
					`The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`,
					true
				);

			rolesGiven.push(role.id);
		});

		const rolesRemovedIds = interaction.options.getString('roles_removed')?.split(',');
		const rolesRemoved: string[] = [];

		rolesRemovedIds?.forEach((rId) => {
			const role = interaction.guild.roles.cache.find((r) => rId.includes(r.id));

			if (!role)
				return ctx.embedify(
					'error',
					'user',
					`The string ${rId} is not a valid role. Please pass a list of @Roles or role ids separated by commas for \`required_roles\`.`,
					true
				);

			rolesRemoved.push(role.id);
		});

		const requiredItemsUF = interaction.options.getString('required_items')?.split(',');
		const requiredItems: string[] = [];

		const items = await ShopModel.find({
			guildId: interaction.guildId,
		});

		requiredItemsUF?.forEach((iName) => {
			const item = items.find((item) => item.name.toLowerCase() == iName.trim().toLowerCase());

			if (!item)
				return ctx.embedify(
					'error',
					'user',
					`The string ${iName} could not be parsed as an inventory item, or an item with such name does not exist. Please pass a list of inventory item names (case-insensitive) separated by commas for \`required_items\`.`,
					true
				);

			requiredItems.push(item._id);
		});

		const item = await ShopModel.create({
			guild: ctx.guildDocument,
			type: 'ITEM',
			name: interaction.options.getString('name'),
			price: interaction.options.getNumber('price'),
			usability: interaction.options.getBoolean('usability'),
			treasuryRequired: interaction.options.getNumber('required_treasury', false) ?? 0,
			active: interaction.options.getBoolean('active', false) ?? true,
			description: interaction.options.getString('description', false) ?? 'A very interesting item.',
			duration: interaction.options.getNumber('duration', false) ?? Number.POSITIVE_INFINITY,
			stackable: interaction.options.getBoolean('stackable', false) ?? true,
			stock: interaction.options.getNumber('stock') ?? Number.POSITIVE_INFINITY,
			rolesGiven,
			rolesRemoved,
			requiredRoles,
			requiredItems,
			createdAt: Date.now(),
		});

		return ctx.embedify('info', 'user', `${item}`, false);
	};
}
