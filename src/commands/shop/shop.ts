import { parseInteger, parseNumber, parseString } from '@adrastopoulos/number-parser';
import ms from 'ms';
import { ILike } from 'typeorm';

import { Item, Listing } from '../../entities';
import { recordTransaction, VariableCollector } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis, ListingDescriptions, ListingEmojis, ListingString } from '../../typings';

const displayListing = (listing: Listing): typeof ExecutionNode.prototype.options => {
	const result: typeof ExecutionNode.prototype.options = [
		['displayInline', `${Emojis.MONEY_STACK} Price`, `${listing.guild.currency} \`${parseNumber(listing.price)}\``],
		['displayInline', `${Emojis.MONEY_BAG} Required Treasury`, `${listing.guild.currency} \`${parseNumber(listing.treasuryRequired)}\``],
		[
			'displayInline',
			`${Emojis.BACKPACK} Items required`,
			listing.itemsRequired.length
				? listing.itemsRequired.map((item) => `\`${item.name}\``).join('\n')
				: '`None`',
		],
		['displayInline', `${Emojis.STACK} Stackable`, `\`${listing.stackable}\``],
		['displayInline', `${Emojis.TREND} Active`, `\`${listing.active}\``],
		['displayInline', `${Emojis.TILES} In Stock`, `\`${listing.stock > 0}\``],
		['displayInline', `${Emojis.KEY} Roles Required`, listing.rolesRequired.length ? listing.rolesRequired.map((role) => `<@&${role}>`).join('\n') : '`None`'],
		['displayInline', `${Emojis.RED_DOWN_ARROW} Roles Removed`, listing.rolesRemoved.length ? listing.rolesRemoved.map((role) => `<@&${role}>`).join('\n') : '`None`'],
		['displayInline', `${Emojis.GREEN_UP_ARROW} Roles Granted`, listing.rolesGranted.length ? listing.rolesGranted.map((role) => `<@&${role}>`).join('\n') : '`None`'],
		['display', `${ListingEmojis[listing.type]} \`${listing.type}\` Item`, `>>> *${ListingDescriptions[listing.type]}*`],
	];

	if (listing.type === 'GENERATOR') {
		result.push(
			['displayInline', 'Generator Period', `\`${ms(listing.generatorPeriod)}\``],
			['displayInline', 'Generator Amount', `${listing.guild.currency} \`${parseNumber(listing.generatorAmount)}\``],
		);
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

const collectors: Record<typeof editableListingProps[number], <T extends any>(collector: VariableCollector<T>) => VariableCollector<T>> = {
	name: (collector) => collector
		.setProperty('name')
		.setPrompt('The listing name.')
		.setParser((msg) => msg.content as any),
	price: (collector) => collector
		.setProperty('price')
		.setPrompt('The amount deducted from the buyer\'s wallet.')
		.addValidator((msg) => parseString(msg.content) !== null && parseString(msg.content) !== undefined, 'Input must be numerical.')
		.addValidator((msg) => parseString(msg.content) >= 0, 'Input must be positive')
		.setParser((msg) => parseString(msg.content) as any),
	description: (collector) => collector
		.setProperty('description')
		.setPrompt('The listing description.')
		.setParser((msg) => msg.content as any)
		.setSkippable(),
	treasuryRequired: (collector) => collector
		.setProperty('required treasury')
		.setPrompt('The minimum treasury balance required to purchase.')
		.addValidator((msg) => parseString(msg.content) !== null, 'Input must be numerical.')
		.addValidator((msg) => parseString(msg.content) >= 0, 'Input must be positive')
		.setParser((msg) => parseString(msg.content) as any)
		.setSkippable(),
	stackable: (collector) => collector
		.setProperty('stackable')
		.setPrompt('Whether users can own multiple items.')
		.addValidator((msg) => ['false', 'true'].includes(msg.content.toLowerCase()), 'Input must be one of `false`, `true`.')
		.setParser((msg) => (msg.content.toLowerCase() === 'true') as any)
		.setSkippable(),
	tradeable: (collector) => collector
		.setProperty('tradeable')
		.setPrompt('Whether users can trade this item.')
		.addValidator((msg) => ['false', 'true'].includes(msg.content.toLowerCase()), 'Input must be one of `false`, `true`.')
		.setParser((msg) => (msg.content.toLowerCase() === 'true') as any)
		.setSkippable(),
	stock: (collector) => collector
		.setProperty('stock')
		.setPrompt('How many of this listing can be sold.')
		.addValidator((msg) => parseInteger(msg.content) !== null, 'Input must be numerical.')
		.addValidator((msg) => parseInteger(msg.content) >= 0, 'Input must be positive')
		.setParser((msg) => parseInteger(msg.content) as any)
		.setSkippable(),
	duration: (collector) => collector
		.setProperty('duration')
		.setPrompt('How long this listing is available.')
		.addValidator((msg) => !!ms(msg.content), 'Input must be a valid duration.')
		.setParser((msg) => ms(msg.content) as any)
		.setSkippable(),
	itemsRequired: (collector) => collector
		.setProperty('required items')
		.setPrompt('Item required to own in order to purchase.')
		.addValidator(async (msg) => !!(await Listing.findBy({ guild: { id: msg.guildId }, name: ILike(msg.content) })).length, 'Could not find that item in the market.')
		.setParser(async (msg) => Listing.findBy({ guild: { id: msg.guildId }, name: ILike(msg.content) }) as any)
		.setSkippable(),
	rolesRequired: (collector) => collector
		.setProperty('required roles')
		.setPrompt('Roles required to own in order to purchase.')
		.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
		.addValidator((msg) => msg.mentions.roles.every((role) => role.comparePositionTo(msg.guild.members.me.roles.highest) < 0), 'That role is higher than mine.')
		.setParser((msg) => Array.from(msg.mentions.roles.keys()) as any)
		.setSkippable(),
	rolesGranted: (collector) => collector
		.setProperty('granted roles')
		.setPrompt('Roles granted upon purchasing.')
		.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
		.addValidator((msg) => msg.mentions.roles.every((role) => role.comparePositionTo(msg.guild.members.me.roles.highest) < 0), 'That role is higher than mine.')
		.setParser((msg) => Array.from(msg.mentions.roles.keys()) as any)
		.setSkippable(),
	rolesRemoved: (collector) => collector
		.setProperty('removed roles')
		.setPrompt('Roles removed upon purchasing.')
		.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
		.addValidator((msg) => msg.mentions.roles.every((role) => role.comparePositionTo(msg.guild.members.me.roles.highest) < 0), 'That role is higher than mine.')
		.setParser((msg) => Array.from(msg.mentions.roles.keys()) as any)
		.setSkippable(),
	generatorAmount: (collector) => collector
		.setProperty('generator amount')
		.setPrompt('The amount generated per iteration.')
		.addValidator((msg) => !!parseString(msg.content), 'Input must be numerical.')
		.setParser((msg) => parseString(msg.content) as any),
	generatorPeriod: (collector) => collector
		.setProperty('generator period')
		.setPrompt('The duration between generation.')
		.addValidator((msg) => !!ms(msg.content), 'Input must be a valid duration.')
		.setParser((msg) => ms(msg.content) as any),
};

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription('Interact with the shop')
		.setModule('SHOP')
		.setFormat('shop')
		.setExamples(['shop']);

	public execution = new Router()
		.get('', (ctx) => {
			const options: typeof ExecutionNode.prototype.options = [];
			if (ctx.interaction.member.permissions.has('ManageGuild')) options.push(['select', '/manage', 'Manage', 'Manage the server shop']);
			return new ExecutionNode()
				.setName('Economica Shop')
				.setDescription('Choose which shop you wish to browse')
				.setOptions(
					['select', '/server', 'Server Shop', 'Browse the local server shop'],
					...options,
				);
		})
		.get('/server', async (ctx) => {
			const listings = await Listing.find({ relations: ['guild', 'itemsRequired'], where: { guild: { id: ctx.interaction.guildId }, active: true } });
			return new ExecutionNode()
				.setName('Server Shop')
				.setDescription(`Browsing the local server shop. There are \`${listings.length}\` active listings`)
				.setOptions(
					...listings.map((listing) => [
						'select',
						`/server/${listing.id}`, listing.name,
						`${ctx.guildEntity.currency} \`${parseNumber(listing.price)}\` | ${listing.description}`,
					] as const),
					['back', ''],
				);
		})
		.get('/server/:id', async (ctx, params) => {
			const { id } = params;
			const listing = await Listing.findOne({ relations: ['guild', 'itemsRequired'], where: { id } });
			const result: typeof ExecutionNode.prototype.options = [];
			if (ctx.interaction.member.permissions.has(['ManageGuild'])) {
				result.push(
					['button', `/server/${id}/edit`, 'Edit Listing'],
					['button', `/server/${id}/delete`, 'Delete listing'],
				);
			}

			return new ExecutionNode()
				.setName(listing.name)
				.setDescription(`${ctx.guildEntity.currency} \`${parseNumber(listing.price)}\` | ${listing.description}`)
				.setOptions(
					...displayListing(listing),
					['button', `/server/${id}/buy`, 'Buy Listing'],
					...result,
					['back', '/server'],
				);
		})
		.get('/server/:id/buy', async (ctx, params) => {
			const { id } = params;
			const listing = await Listing.findOne({ relations: ['guild', 'itemsRequired'], where: { id } });
			const existingItem = await Item.findOneBy({
				owner: { guildId: ctx.guildEntity.id, userId: ctx.userEntity.id },
				listing: { id: listing.id },
			});

			const amount = await new VariableCollector<number>()
				.setProperty('amount')
				.setPrompt('The number of this listing to purchase.')
				.addValidator((msg) => !!parseInteger(msg.content), 'Could not parse input')
				.addValidator((msg) => parseInteger(msg.content) > 0, 'Input must be greater than 0.')
				.setParser((msg) => parseInteger(msg.content))
				.execute(ctx);

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
			if (listing.stock < amount) throw new CommandError('This listing is **out of stock**.');
			if (!listing.stackable && existingItem) throw new CommandError('You **already own** this item.');
			if (missingItems.length) throw new CommandError(`You must own ${missingItems.map((item) => `\`${item.name}\``).join(', ')} to purchase this listing.`);
			if (missingRoles.length) throw new CommandError(`You must have the roles ${missingRoles.map((role) => `<@&${role}>`).join(', ')} to buy this item.`);
			if (listing.treasuryRequired > ctx.memberEntity.treasury) throw new CommandError(`You must have a **treasury balance** of ${ctx.guildEntity.currency} \`${listing.treasuryRequired}\` to purchase this listing.`);
			if (listing.price * amount > ctx.memberEntity.wallet) throw new CommandError(`You **cannot afford** \`${amount}\` of this item.`);

			// Purchase complete
			listing.stock -= amount;
			await listing.save();

			if (existingItem) {
				existingItem.amount += amount;
				await existingItem.save();
			} else {
				const item = await Item.create({
					listing,
					owner: ctx.memberEntity,
					amount,
				}).save();
				if (item.listing.type === 'INSTANT' || item.listing.type === 'COLLECTABLE') {
					item.listing.rolesGranted.forEach((role) => ctx.interaction.member.roles.add(role, `Purchased ${item.listing.name}`));
					item.listing.rolesRemoved.forEach((role) => ctx.interaction.member.roles.remove(role, `Purchased ${item.listing.name}`));
					if (item.listing.type === 'INSTANT') await item.remove();
				}
			}

			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BUY', -(listing.price * amount), 0);
			return new ExecutionNode()
				.setName(`Purchasing ${amount} x ${listing.name}`)
				.setDescription(`${Emojis.CHECK} **Listing Purchased Successfully**`)
				.setOptions(['back', '/server']);
		})
		.get('/server/:id/edit', async (ctx, params) => {
			const { id } = params;
			const listing = await Listing.findOne({ relations: ['itemsRequired'], where: { id } });
			return new ExecutionNode()
				.setName(`Editing ${listing.name}`)
				.setDescription('Edit this listing')
				.setOptions(
					...Object
						.keys(listing)
						.filter((value) => {
							if (!editableListingProps.includes(value as any)) return false;
							if (listing.type !== 'GENERATOR' && ['generatorAmount', 'generatorPeriod'].includes(value)) return false;
							return true;
						})
						.map((key) => ['select', `/server/${id}/edit/${key}`, key, `Edit the \`${key}\` property of ${listing.name}.`] as const),
					['back', `/server/${id}`],
				);
		})
		.get('/server/:id/edit/:property', async (ctx, params) => {
			const { id, property } = params as { id: string, property: keyof typeof collectors };
			const value = await collectors[property](new VariableCollector()).execute(ctx);
			await Listing.update({ id }, { [property]: value });
			return new ExecutionNode()
				.setName('Updating...')
				.setDescription(`${Emojis.DEED} **Shop Listing Updated Successfully**`)
				.setOptions(['back', `/server/${id}`]);
		})
		.get('/server/:id/delete', async (ctx, params) => {
			const { id } = params;
			const items = await Item.findBy({ listing: { id } });
			return new ExecutionNode()
				.setName('Delete Listing')
				.setDescription(`Deleting this listing will remove \`${items.reduce(((prev, curr) => prev + curr.amount), 0)}\` items from \`${items.length}\` inventories.`)
				.setOptions(
					['button', `/server/${id}`, 'Cancel'],
					['button', `/server/${id}/delete/confirm`, 'Delete'],
				);
		})
		.get('/server/:id/delete/confirm', async (ctx, params) => {
			const { id } = params;
			const listing = await Listing.findOneBy({ id });
			await listing.remove();
			return new ExecutionNode()
				.setName(`Deleting ${listing.name}...`)
				.setDescription(`${Emojis.CROSS} **Shop Listing Deleted**`)
				.setOptions(['back', '/server']);
		})
		.get('/manage', () => new ExecutionNode()
			.setName('Shop Management')
			.setDescription('Manage the local server shop')
			.setOptions(
				['select', '/manage/create', 'Create Shop Listing', 'Create a new shop listing'],
				['back', ''],
			))
		.get('/manage/create', () => new ExecutionNode()
			.setName('Creating Shop Listing')
			.setDescription('Choose the listing type')
			.setOptions(
				['select', '/manage/create/COLLECTABLE', 'Collectable', 'Create a collectable shop item'],
				['select', '/manage/create/INSTANT', 'Instant', 'Create an instant shop item'],
				['select', '/manage/create/USABLE', 'Usable', 'Create a usable shop item'],
				['select', '/manage/create/GENERATOR', 'Generator', 'Create a generator shop item'],
				['back', '/manage'],
			))
		.get('/manage/create/:type', async (ctx, params) => {
			const type = params.type as ListingString;
			const name = await collectors.name(new VariableCollector<string>()).execute(ctx);
			const price = await collectors.price(new VariableCollector<number>()).execute(ctx);
			const treasuryRequired = await collectors.treasuryRequired(new VariableCollector<number>()).execute(ctx) ?? 0;
			const description = await collectors.description(new VariableCollector<string>()).execute(ctx) ?? 'No description.';
			const stock = await collectors.stock(new VariableCollector<number>()).execute(ctx) ?? Infinity;
			const duration = await collectors.duration(new VariableCollector<number>()).execute(ctx) ?? Infinity;
			const stackable = await collectors.stackable(new VariableCollector<boolean>()).execute(ctx) ?? false;
			const tradeable = await collectors.tradeable(new VariableCollector<boolean>()).execute(ctx) ?? true;
			const itemsRequired = await collectors.itemsRequired(new VariableCollector<Listing[]>()).execute(ctx) ?? [];
			const rolesRequired = await collectors.rolesRequired(new VariableCollector<string[]>()).execute(ctx) ?? [];
			const rolesGranted = await collectors.rolesGranted(new VariableCollector<string[]>()).execute(ctx) ?? [];
			const rolesRemoved = await collectors.rolesRemoved(new VariableCollector<string[]>()).execute(ctx) ?? [];

			const listing = Listing.create({
				guild: ctx.guildEntity,
				active: false,
				name,
				price,
				type,
				treasuryRequired,
				description,
				duration,
				stock,
				stackable,
				tradeable,
				itemsRequired,
				rolesRequired,
				rolesGranted,
				rolesRemoved,
			});

			if (type === 'GENERATOR') {
				const generatorAmount = await new VariableCollector<number>()
					.setProperty('generator amount')
					.setPrompt('The amount generated per iteration.')
					.addValidator((msg) => !!parseString(msg.content), 'Input must be numerical.')
					.setParser((msg) => parseString(msg.content))
					.execute(ctx);
				const generatorPeriod = await new VariableCollector<number>()
					.setProperty('generator period')
					.setPrompt('The duration between generation.')
					.addValidator((msg) => !!ms(msg.content), 'Input must be a valid duration.')
					.setParser((msg) => ms(msg.content))
					.execute(ctx);
				listing.generatorAmount = generatorAmount;
				listing.generatorPeriod = generatorPeriod;
			}

			await listing.save();
			return new ExecutionNode()
				.setName(`Creating ${listing.name}`)
				.setDescription('Confirm or cancel this listing creation')
				.setOptions(
					...displayListing(listing),
					['button', `/listing/create/${listing.id}/cancel`, 'Cancel'],
					['button', `/listing/create/${listing.id}/confirm`, 'Create'],
				);
		})
		.get('/listing/create/:id/cancel', async (ctx, params) => {
			const { id } = params;
			await Listing.delete({ id });
			return new ExecutionNode()
				.setName('Cancelling...')
				.setDescription(`${Emojis.CROSS} **Shop Listing Cancelled**`)
				.setOptions(['back', '']);
		})
		.get('/listing/create/:id/confirm', async (ctx, params) => {
			const { id } = params;
			await Listing.update({ id }, { active: true });
			return new ExecutionNode()
				.setName('Creating...')
				.setDescription(`${Emojis.DEED} **Shop Listing Created Successfully**`)
				.setOptions(['back', '']);
		});
}
