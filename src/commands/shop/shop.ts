import { parseInteger, parseNumber, parseString } from '@adrastopoulos/number-parser';
import ms from 'ms';
import { ILike } from 'typeorm';

import { Item, Listing } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, VariableCollector } from '../../structures';
import { Emojis, ListingDescriptions, ListingEmojis, ListingString } from '../../typings';

const displayListing = (listing: Listing): ExecutionNode[] => {
	const result = [
		new ExecutionNode()
			.setName(`${Emojis.MONEY_STACK} Price`)
			.setValue('listing_view_price')
			.setType('displayInline')
			.setDescription(`${listing.guild.currency} \`${parseNumber(listing.price)}\``),
		new ExecutionNode()
			.setName(`${Emojis.MONEY_BAG} Required Treasury`)
			.setValue('listing_view_requiredTreasury')
			.setType('displayInline')
			.setDescription(`${listing.guild.currency} \`${parseNumber(listing.treasuryRequired)}\``),
		new ExecutionNode()
			.setName(`${Emojis.BACKPACK} Items required`)
			.setValue('listing_view_itemsRequired')
			.setType('displayInline')
			.setDescription(listing.itemsRequired.length
				? listing.itemsRequired.map((item) => `\`${item.name}\``).join('\n')
				: '`None`'),
		new ExecutionNode()
			.setName(`${Emojis.STACK} Stackable`)
			.setValue('listing_view_stackable')
			.setType('displayInline')
			.setDescription(`\`${listing.stackable}\``),
		new ExecutionNode()
			.setName(`${Emojis.TREND} Active`)
			.setValue('listing_view_active')
			.setType('displayInline')
			.setDescription(`\`${listing.active}\``),
		new ExecutionNode()
			.setName(`${Emojis.TILES} In Stock`)
			.setValue('listing_view_stock')
			.setType('displayInline')
			.setDescription(`\`${listing.stock > 0}\``),
		new ExecutionNode()
			.setName(`${Emojis.KEY} Roles Required`)
			.setValue('listing_view_rreq')
			.setType('displayInline')
			.setDescription(listing.rolesRequired.length ? listing.rolesRequired.map((role) => `<@&${role}>`).join('\n') : '`None`'),
		new ExecutionNode()
			.setName(`${Emojis.RED_DOWN_ARROW} Roles Removed`)
			.setValue('listing_view_rrem')
			.setType('displayInline')
			.setDescription(listing.rolesRemoved.length ? listing.rolesRemoved.map((role) => `<@&${role}>`).join('\n') : '`None`'),
		new ExecutionNode()
			.setName(`${Emojis.GREEN_UP_ARROW} Roles Granted`)
			.setValue('listing_view_rg')
			.setType('displayInline')
			.setDescription(listing.rolesGranted.length ? listing.rolesGranted.map((role) => `<@&${role}>`).join('\n') : '`None`'),
		new ExecutionNode()
			.setName(`${ListingEmojis[listing.type]} \`${listing.type}\` Item`)
			.setValue('listing_view_type')
			.setType('displayInline')
			.setDescription(`>>> ${ListingDescriptions[listing.type]}`),
	];

	if (listing.type === 'GENERATOR') {
		result.concat([
			new ExecutionNode()
				.setName('Generator Period')
				.setValue('listing_view_period')
				.setType('displayInline')
				.setDescription(`\`${ms(listing.generatorPeriod)}\``),
			new ExecutionNode()
				.setName('Generator Amount')
				.setValue('listing_view_amount')
				.setType('displayInline')
				.setDescription(`${listing.guild.currency} \`${parseNumber(listing.generatorAmount)}\``),
		]);
	}

	return result;
};

const editableListingProps = [
	'name',
	'price',
	'treasuryRequired',
	'description',
	'stackable',
	'tradeable',
	'stock',
	'duration',
	'itemsRequired',
	'rolesRequired',
	'rolesGranted',
	'rolesRemoved',
	'generatorPeriod',
	'generatorAmount',
] as const;

const collectors: Record<typeof editableListingProps[number], (collector: VariableCollector) => VariableCollector> = {
	name: (collector) => collector
		.setProperty('name')
		.setPrompt('The listing name.')
		.setParser((msg) => msg.content),
	price: (collector) => collector
		.setProperty('price')
		.setPrompt('The amount deducted from the buyer\'s wallet.')
		.addValidator((msg) => parseString(msg.content) !== null && parseString(msg.content) !== undefined, 'Input must be numerical.')
		.addValidator((msg) => parseString(msg.content) >= 0, 'Input must be positive')
		.setParser((msg) => parseString(msg.content)),
	description: (collector) => collector
		.setProperty('description')
		.setPrompt('The listing description.')
		.setParser((msg) => msg.content)
		.setSkippable(),
	treasuryRequired: (collector) => collector
		.setProperty('required treasury')
		.setPrompt('The minimum treasury balance required to purchase.')
		.addValidator((msg) => parseString(msg.content) !== null, 'Input must be numerical.')
		.addValidator((msg) => parseString(msg.content) >= 0, 'Input must be positive')
		.setParser((msg) => parseString(msg.content))
		.setSkippable(),
	stackable: (collector) => collector
		.setProperty('stackable')
		.setPrompt('Whether users can own multiple items.')
		.addValidator((msg) => ['false', 'true'].includes(msg.content.toLowerCase()), 'Input must be one of `false`, `true`.')
		.setParser((msg) => msg.content.toLowerCase() === 'true')
		.setSkippable(),
	tradeable: (collector) => collector
		.setProperty('tradeable')
		.setPrompt('Whether users can trade this item.')
		.addValidator((msg) => ['false', 'true'].includes(msg.content.toLowerCase()), 'Input must be one of `false`, `true`.')
		.setParser((msg) => msg.content.toLowerCase() === 'true')
		.setSkippable(),
	stock: (collector) => collector
		.setProperty('stock')
		.setPrompt('How many of this listing can be sold.')
		.addValidator((msg) => parseInteger(msg.content) !== null, 'Input must be numerical.')
		.addValidator((msg) => parseInteger(msg.content) >= 0, 'Input must be positive')
		.setParser((msg) => parseInteger(msg.content))
		.setSkippable(),
	duration: (collector) => collector
		.setProperty('duration')
		.setPrompt('How long this listing is available.')
		.addValidator((msg) => !!ms(msg.content), 'Input must be a valid duration.')
		.setParser((msg) => ms(msg.content))
		.setSkippable(),
	itemsRequired: (collector) => collector
		.setProperty('required items')
		.setPrompt('Item required to own in order to purchase.')
		.addValidator(async (msg, ctx) => !!(await Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(msg.content) })).length, 'Could not find that item in the market.')
		.setParser(async (msg, ctx) => Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(msg.content) }))
		.setSkippable(),
	rolesRequired: (collector) => collector
		.setProperty('required roles')
		.setPrompt('Roles required to own in order to purchase.')
		.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
		.addValidator((msg) => msg.mentions.roles.every((role) => role.comparePositionTo(msg.guild.members.me.roles.highest) < 0), 'That role is higher than mine.')
		.setParser((msg) => Array.from(msg.mentions.roles.keys()))
		.setSkippable(),
	rolesGranted: (collector) => collector
		.setProperty('granted roles')
		.setPrompt('Roles granted upon purchasing.')
		.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
		.addValidator((msg) => msg.mentions.roles.every((role) => role.comparePositionTo(msg.guild.members.me.roles.highest) < 0), 'That role is higher than mine.')
		.setParser((msg) => Array.from(msg.mentions.roles.keys()))
		.setSkippable(),
	rolesRemoved: (collector) => collector
		.setProperty('removed roles')
		.setPrompt('Roles removed upon purchasing.')
		.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
		.addValidator((msg) => msg.mentions.roles.every((role) => role.comparePositionTo(msg.guild.members.me.roles.highest) < 0), 'That role is higher than mine.')
		.setParser((msg) => Array.from(msg.mentions.roles.keys()))
		.setSkippable(),
	generatorAmount: (collector) => collector
		.setProperty('generator amount')
		.setPrompt('The amount generated per iteration.')
		.addValidator((msg) => !!parseString(msg.content), 'Input must be numerical.')
		.setParser((msg) => parseString(msg.content)),
	generatorPeriod: (collector) => collector
		.setProperty('generator period')
		.setPrompt('The duration between generation.')
		.addValidator((msg) => !!ms(msg.content), 'Input must be a valid duration.')
		.setParser((msg) => ms(msg.content)),
};

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription('Interact with the shop')
		.setModule('SHOP')
		.setFormat('shop')
		.setExamples(['shop']);

	public execution = new ExecutionNode()
		.setName('Economica Shop')
		.setValue('shop')
		.setDescription('Choose which shop you wish to browse')
		.setOptions(() => [
			new ExecutionNode()
				.setName('Server Shop')
				.setValue('shop_server')
				.setType('select')
				.setDescription('Browse the local server shop')
				.setOptions(async (ctx) => {
					const listings = await Listing.find({
						relations: ['guild', 'itemsRequired'],
						where: { guild: { id: ctx.interaction.guildId }, active: true },
					});

					return listings.map(
						(listing) => new ExecutionNode()
							.setName(`${listing.name}`)
							.setValue(listing.id)
							.setDescription(`${ctx.guildEntity.currency} \`${parseNumber(listing.price)}\` | ${listing.description}`)
							.setOptions(() => [
								...displayListing(listing),
								new ExecutionNode()
									.setName('Buy Listing')
									.setValue('shop_buy')
									.setType('button')
									.setDescription(`Buy this listing for ${ctx.guildEntity.currency} \`${parseNumber(listing.price)}\``)
									.setExecution(async (ctx) => {
										const existingItem = await Item.findOneBy({
											owner: { guildId: ctx.guildEntity.id, userId: ctx.userEntity.id },
											listing: { id: listing.id },
										});

										// Validation
										const missingItems: Listing[] = [];
										for await (const item of listing.itemsRequired) {
											const memberItem = await Item.findOneBy({
												owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId },
												listing: { id: item.id },
											});
											if (!memberItem) missingItems.push(item);
										}

										const missingRoles: string[] = [];
										listing.rolesRequired.forEach(async (role) => {
											if (!ctx.interaction.member.roles.cache.has(role)) missingRoles.push(role);
										});

										if (!listing.active) throw new CommandError('This listing is **not active**.');
										if (listing.stock < 1) throw new CommandError('This listing is **out of stock**.');
										if (!listing.stackable && existingItem) throw new CommandError('You **already own** this item.');
										if (missingItems.length) throw new CommandError(`You must own ${missingItems.map((item) => `\`${item.name}\``).join(', ')} to purchase this listing.`);
										if (missingRoles.length) throw new CommandError(`You must have the roles ${missingRoles.map((role) => `<@&${role}>`).join(', ')} to buy this item.`);
										if (listing.treasuryRequired > ctx.memberEntity.treasury) throw new CommandError(`You must have a **treasury balance** of ${ctx.guildEntity.currency}${listing.treasuryRequired} to purchase this listing.`);
										if (listing.price > ctx.memberEntity.wallet) throw new CommandError('You **cannot afford** this item.');

										// Purchase complete
										listing.stock -= 1;
										await listing.save();

										if (existingItem) {
											existingItem.amount += 1;
											await existingItem.save();
										} else {
											const item = await Item.create({
												listing,
												owner: ctx.memberEntity,
												amount: 1,
											}).save();
											if (item.listing.type === 'INSTANT' || item.listing.type === 'COLLECTABLE') {
												item.listing.rolesGranted.forEach((role) => ctx.interaction.member.roles.add(role, `Purchased ${item.listing.name}`));
												item.listing.rolesRemoved.forEach((role) => ctx.interaction.member.roles.remove(role, `Purchased ${item.listing.name}`));
												if (item.listing.type === 'INSTANT') await item.remove();
											}
										}

										await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BUY', -listing.price, 0);
									})
									.setOptions(() => [
										new ExecutionNode()
											.setName('Purchasing...')
											.setValue('shop_buy_result')
											.setType('display')
											.setDescription(`${Emojis.CHECK} **Listing Purchased Successfully**`),
									]),
								new ExecutionNode()
									.setName('Edit Listing')
									.setValue('shop_edit')
									.setType('button')
									.setDescription("Edit this listing's properties")
									.setPredicate((ctx) => ctx.interaction.member.permissions.has(['ManageGuild']))
									.setOptions(() => Object
										.keys(listing)
										.filter((value) => {
											if (!editableListingProps.includes(value as any)) return false;
											if (listing.type !== 'GENERATOR' && ['generatorAmount', 'generatorPeriod'].includes(value)) return false;
											return true;
										})
										.map((key) => new ExecutionNode()
											.setName(key)
											.setValue(`shop_edit_${key}`)
											.setDescription(`Edit the ${key} property of ${listing.name}.`)
											.collectVar(collectors[key])
											.setOptions(() => [
												new ExecutionNode()
													.setName('Cancel')
													.setValue(`shop_edit_${key}_cancel`)
													.setType('button')
													.setDescription(`${Emojis.CROSS} **Shop Listing Update Cancelled**`),
												new ExecutionNode()
													.setName('Update')
													.setValue(`shop_edit_${key}_update`)
													.setType('button')
													.setDescription(`${Emojis.DEED} **Shop Listing Updated Successfully**`)
													.setExecution(async () => {
														listing[key] = ctx.variables[key];
														await listing.save();
													}),
											]))),
								new ExecutionNode()
									.setName('Delete Listing')
									.setValue('shop_delete')
									.setDescription('Delete this listing from the shop')
									.setPredicate((ctx) => ctx.interaction.member.permissions.has(['ManageGuild']))
									.setOptions((ctx) => [
										new ExecutionNode()
											.setName('Warning')
											.setValue('shop_delete_warn')
											.setType('display')
											.setDescription(`Deleting this listing will remove \`${ctx.variables.affectedMembers.reduce(((prev, curr) => prev + curr.amount), 0)}\` items from \`${ctx.variables.affectedMembers.length}\` inventories.`),
										new ExecutionNode()
											.setName('Cancel')
											.setValue('shop_delete_cancel')
											.setType('button')
											.setDescription(`${Emojis.CROSS} **Shop Listing Deletion Cancelled**`),
										new ExecutionNode()
											.setName('Delete')
											.setValue('shop_delete_confirm')
											.setType('button')
											.setDescription(`${Emojis.DEED} **Shop Listing Deleted Successfully**`)
											.setExecution(async () => {
												await listing.remove();
											}),
									]),
							]),
					);
				}),
			new ExecutionNode()
				.setName('Manage')
				.setValue('shop_manage')
				.setType('select')
				.setDescription('Manage the local server shop')
				.setPredicate((ctx) => ctx.interaction.member.permissions.has(['ManageGuild']))
				.setOptions(() => [
					new ExecutionNode()
						.setName('Create Shop Listing')
						.setValue('shop_manage_create')
						.setType('select')
						.setDescription('Create a new shop listing')
						.setOptions(async () => [
							await this.itemCreator(
								new ExecutionNode()
									.setName('Collectable')
									.setValue('shop_manage_create_collectable')
									.setType('select')
									.setDescription('Create a collectable shop item.'),
								'COLLECTABLE',
							),
							await this.itemCreator(
								new ExecutionNode()
									.setName('Instant')
									.setValue('shop_manage_create_instant')
									.setType('select')
									.setDescription('Create an instant shop item.'),
								'INSTANT',
							),
							await this.itemCreator(
								new ExecutionNode()
									.setName('Usable')
									.setValue('shop_manage_create_usable')
									.setType('select')
									.setDescription('Create a usable shop item.'),
								'USABLE',
							),
							await this.itemCreator(
								new ExecutionNode()
									.setName('Generator')
									.setValue('shop_manage_create_generator')
									.setType('select')
									.setDescription('Create a generator shop item.')
									.collectVar((collector) => collector
										.setProperty('generator amount')
										.setPrompt('The amount generated per iteration.')
										.addValidator((msg) => !!parseString(msg.content), 'Input must be numerical.')
										.setParser((msg) => parseString(msg.content)))
									.collectVar((collector) => collector
										.setProperty('generator period')
										.setPrompt('The duration between generation.')
										.addValidator((msg) => !!ms(msg.content), 'Input must be a valid duration.')
										.setParser((msg) => ms(msg.content))),
								'GENERATOR',
							),
						]),
				]),
		]);

	private itemCreator = async (node: ExecutionNode, type: ListingString) => {
		node
			.setExecution(async (ctx) => {
				const listing = new Listing();

				listing.guild = ctx.guildEntity;
				listing.createdAt = new Date();
				listing.active = true;
				listing.type = type;

				listing.name = ctx.variables.name;
				listing.price = ctx.variables.price;
				listing.treasuryRequired = ctx.variables['required treasury'] ?? 0;
				listing.description = ctx.variables.description ?? 'No description.';
				listing.duration = ctx.variables.duration ?? Infinity;
				listing.stock = ctx.variables.stock ?? Infinity;
				listing.stackable = ctx.variables.stackable ?? false;
				listing.tradeable = ctx.variables.tradeable ?? true;
				listing.itemsRequired = ctx.variables['required items'] ?? [];
				listing.rolesRequired = ctx.variables['required roles'] ?? [];
				listing.rolesGranted = ctx.variables['granted roles'] ?? [];
				listing.rolesRemoved = ctx.variables['removed roles'] ?? [];
				if (listing.type === 'GENERATOR') {
					listing.generatorAmount = ctx.variables['generator amount'];
					listing.generatorPeriod = ctx.variables['generator period'];
				}

				ctx.variables.listing = listing;
			})
			.setOptions((ctx) => [
				...displayListing(ctx.variables.listing),
				new ExecutionNode()
					.setName('Cancel')
					.setValue('shop_create_cancel')
					.setType('button')
					.setDescription(`${Emojis.CROSS} **Shop Listing Cancelled**`),
				new ExecutionNode()
					.setName('Create')
					.setValue('shop_create_confirm')
					.setType('button')
					.setDescription(`${Emojis.DEED} **Shop Listing Created Successfully**`)
					.setExecution(async (ctx) => {
						await ctx.variables.listing.save();
					}),
			]);

		// eslint-disable-next-line no-restricted-syntax
		for (const collector of Object.keys(collectors)) if (collector !== 'generatorPeriod' && collector !== 'generatorAmount') node.collectVar(collectors[collector]);
		return node;
	};
}
