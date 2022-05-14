import { parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { Listing } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis, ListingString } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('listing')
		.setDescription('Manage or create shop listings')
		.setModule('SHOP')
		.setFormat('listing')
		.setExamples(['listing'])
		.setPermissions(PermissionFlagsBits.ManageGuild.toString())
		.addSubcommand((subcommand) => subcommand
			.setName('create')
			.setDescription('Create a new item')
			.addStringOption((option) => option
				.setName('name')
				.setDescription('Specify the name')
				.setRequired(true))
			.addStringOption((option) => option
				.setName('price')
				.setDescription('Specify the price')
				.setRequired(true))
			.addStringOption((option) => option
				.setName('type')
				.setDescription('Specify the type')
				.setRequired(true)
				.addChoices(
					{ name: 'Classic', value: 'CLASSIC' },
					{ name: 'Instant', value: 'INSTANT' },
					{ name: 'Usable', value: 'USABLE' },
					{ name: 'Generator', value: 'GENERATOR' },
				))
			.addBooleanOption((option) => option
				.setName('active')
				.setDescription('Whether or not this listing is active on the shop')
				.setRequired(true))
			.addStringOption((option) => option
				.setName('treasury_required')
				.setDescription('Specify the treasury balance required to purchase this listing'))
			.addStringOption((option) => option
				.setName('description')
				.setDescription('Enter a description for this listing'))
			.addStringOption((option) => option
				.setName('duration')
				.setDescription('Specify the time that this listing stays on the shop'))
			.addStringOption((option) => option
				.setName('stock')
				.setDescription('Specify the number of items that may be sold from this listing'))
			.addBooleanOption((option) => option
				.setName('stackable')
				.setDescription('Whether or not a user may have more than a single item'))
			.addStringOption((option) => option
				.setName('items_required')
				.setDescription('Items required to purchase this listing'))
			.addRoleOption((option) => option
				.setName('roles_required')
				.setDescription('Specify a role required to purchase this listing'))
			.addRoleOption((option) => option
				.setName('roles_removed')
				.setDescription('Specify a role removed when purchasing this listing'))
			.addRoleOption((option) => option
				.setName('roles_given')
				.setDescription('Specify a role given when purchasing this listing'))
			.addStringOption((option) => option
				.setName('generator_period')
				.setDescription('If a generator, duration between generating money'))
			.addStringOption((option) => option
				.setName('generator_amount')
				.setDescription('If a generator, the amount of money generated at each period')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'create') {
			const name = ctx.interaction.options.getString('name');
			const price = ctx.interaction.options.getString('price');
			const type = ctx.interaction.options.getString('type') as ListingString;
			const active = ctx.interaction.options.getBoolean('active');
			const treasuryRequired = ctx.interaction.options.getString('treasury_required', false);
			const description = ctx.interaction.options.getString('description', false) ?? 'No description';
			const duration = ctx.interaction.options.getString('duration', false);
			const stock = ctx.interaction.options.getString('stock', false);
			const stackable = ctx.interaction.options.getBoolean('stackable', false) ?? false;
			const itemsRequired = ctx.interaction.options.getString('items_required', false);
			const rolesRequired = ctx.interaction.options.getRole('roles_required', false);
			const rolesRemoved = ctx.interaction.options.getRole('roles_removed', false);
			const rolesGiven = ctx.interaction.options.getRole('roles_given', false);
			const generatorPeriod = ctx.interaction.options.getString('generator_period', false);
			const generatorAmount = ctx.interaction.options.getString('generator_amount', false);

			// Validate
			if (price && !parseString(price)) await ctx.embedify('error', 'user', `Could not parse price \`${price}\`.`).send();
			else if (price && parseString(price) < 0) await ctx.embedify('error', 'user', 'Price must be greater than or equal to 0.').send();
			else if (treasuryRequired && !parseString(treasuryRequired)) await ctx.embedify('error', 'user', `Could not parse required treasury balance \`${treasuryRequired}\`.`).send();
			else if (treasuryRequired && parseString(treasuryRequired) < 0) await ctx.embedify('error', 'user', 'Required treasury balance must be greater than or equal to 0.').send();
			else if (duration && !ms(duration)) await ctx.embedify('error', 'user', `Could not parse duration \`${duration}\``).send();
			else if (duration && ms(duration) < 1) await ctx.embedify('error', 'user', 'Duration must be more than 0').send();
			else if (stock && !parseString(stock)) await ctx.embedify('error', 'user', `Could not parse stock \`${treasuryRequired}\`.`).send();
			else if (stock && parseString(stock) < 1) await ctx.embedify('error', 'user', 'Stock must be greater than 0.').send();
			else if (itemsRequired) {
				const listing = await Listing.findOneBy({ guild: { id: ctx.guildEntity.id }, name: 'query' });
				if (!listing) await ctx.embedify('error', 'user', `Could not find existing shop listing named \`${listing}\``).send();
			} else if (type === 'GENERATOR') {
				if (!generatorPeriod) await ctx.embedify('error', 'user', 'Missing option `generator_period`.').send();
				else if (!ms(generatorPeriod)) await ctx.embedify('error', 'user', `Could not parse generator period \`${generatorPeriod}\`.`).send();
				else if (!generatorAmount) await ctx.embedify('error', 'user', 'Missing option `generator_amount`.').send();
				else if (!parseString(generatorAmount)) await ctx.embedify('error', 'user', `Could not parse generator amount \`${generatorAmount}\`.`).send();
			}

			if (ctx.interaction.replied) return;

			const requiredListing = await Listing.findOneBy({ guild: { id: ctx.guildEntity.id }, name: itemsRequired });

			await Listing.create({
				guild: ctx.guildEntity,
				type,
				name,
				price: parseString(price),
				treasuryRequired: treasuryRequired ? parseString(treasuryRequired) : 0,
				active,
				description,
				stackable,
				stock: stock ? parseString(stock) : Infinity,
				duration: duration ? ms(duration) : Infinity,
				itemsRequired: itemsRequired ? [requiredListing] : [],
				rolesRequired: rolesRequired ? [rolesRequired.id] : [],
				rolesGiven: rolesGiven ? [rolesGiven.id] : [],
				rolesRemoved: rolesRemoved ? [rolesRemoved.id] : [],
				generatorAmount: generatorAmount ? parseString(generatorAmount) : null,
				generatorPeriod: generatorPeriod ? ms(generatorPeriod) : null,
			}).save();

			await ctx.embedify('success', 'user', `${Emojis.CHECK} **Listing Created Successfully**`).send();
		}
	};
}
