import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import ms from 'ms';
import { ILike } from 'typeorm';

import { Item, Listing } from '../../entities';
import { displayListing, recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription('Interact with the shop')
		.setModule('SHOP')
		.setFormat('shop')
		.setExamples(['shop']);

	public execute = new ExecutionBuilder()
		.setName('Economica Shop')
		.setValue('shop')
		.setDescription('Choose which shop you wish to browse')
		.setOptions([
			new ExecutionBuilder()
				.setName('Server Shop')
				.setValue('server')
				.setDescription('Browse the local server shop')
				.setPagination(
					(ctx) => Listing.find({ relations: ['guild', 'itemsRequired'], where: { guild: { id: ctx.interaction.guildId }, active: true } }),
					(listing, ctx) => new ExecutionBuilder()
						.setName(`${listing.name}`)
						.setValue(listing.id)
						.setDescription(`${ctx.guildEntity.currency} \`${parseNumber(listing.price)}\` | ${listing.description}`)
						.setEmbed(displayListing(ctx, listing))
						.setOptions([
							new ExecutionBuilder()
								.setName('Buy Listing')
								.setValue('buy')
								.setDescription(`Buy this listing for ${parseNumber(listing.price)}`)
								.setExecution(async (ctx, interaction) => {
									const existingItem = await Item.findOneBy({ owner: { guildId: ctx.guildEntity.id, userId: ctx.userEntity.id }, listing: { id: listing.id } });

									// Validation
									const missingItems: Listing[] = [];
									listing?.itemsRequired?.forEach(async (item) => {
										const memberItem = await Item.findOneBy({ owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId }, listing: { id: item.id } });
										if (!memberItem) missingItems.push(item);
									});
									const missingRoles: string[] = [];
									listing?.rolesRequired?.forEach(async (role) => {
										if (!ctx.interaction.member.roles.cache.has(role)) missingRoles.push(role);
									});

									if (!listing.active) {
										const embed = ctx.embedify('warn', 'user', 'This listing is **not active**.');
										await interaction.update({ embeds: [embed], components: [] });
									} else if (listing.stock < 1) {
										const embed = ctx.embedify('warn', 'user', 'This listing is **out of stock**.');
										await interaction.update({ embeds: [embed], components: [] });
									} else if (!listing.stackable && existingItem) {
										const embed = ctx.embedify('warn', 'user', 'You **already own** this item.');
										await interaction.update({ embeds: [embed], components: [] });
									} else if (missingItems.length) {
										const embed = ctx.embedify('warn', 'user', `You must own ${missingItems.map((item) => `\`${item.name}\``).join(', ')} to purchase this listing.`);
										await interaction.update({ embeds: [embed], components: [] });
									} else if (missingRoles.length) {
										const embed = ctx.embedify('warn', 'user', `You must have the roles ${missingRoles.map((role) => `<@${role}>`).join(', ')} to buy this item.`); await interaction.update({ embeds: [embed], components: [] });
									} else if (listing.treasuryRequired > ctx.memberEntity.treasury) {
										const embed = ctx.embedify('warn', 'user', `You must have a **treasury balance** of ${ctx.guildEntity.currency}${listing.treasuryRequired} to purchase this listing.`);
										await interaction.update({ embeds: [embed], components: [] });
									} else if (listing.price > ctx.memberEntity.wallet) {
										const embed = ctx.embedify('warn', 'user', 'You **cannot afford** this item.');
										await interaction.update({ embeds: [embed], components: [] });
									}

									if (interaction.replied) return;

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
										if (item.listing.type === 'INSTANT') {
											item.listing.rolesGranted.forEach((role) => ctx.interaction.member.roles.add(role, `Purchased ${item.listing.name}`));
											item.listing.rolesRemoved.forEach((role) => ctx.interaction.member.roles.remove(role, `Purchased ${item.listing.name}`));
											await item.remove();
										}
									}

									await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BUY', -listing.price, 0);
									const embed = ctx.embedify('success', 'user', `${Emojis.CHECK} **Listing Purchased Successfully**`);
									await interaction.update({ embeds: [embed], components: [] });
								}),
							new ExecutionBuilder()
								.setName('Edit Listing')
								.setValue('edit')
								.setDescription('Edit this listing\'s properties')
								.setPermissions(['ManageGuild'])
								.setPagination(
									(ctx) => Object.keys(listing),
									(key, ctx) => new ExecutionBuilder()
										.setName(key)
										.setValue(key)
										.setDescription(`Edit the ${key} property of ${listing.name}.`),
								)
								.setExecution(async (ctx, interaction) => {
									listing.name = this.execute.getVariable('name') ?? listing.name;
									listing.price = this.execute.getVariable('price') ?? listing.price;
									listing.type = this.execute.getVariable('type') ?? listing.type;
									listing.treasuryRequired = this.execute.getVariable('required treasury') ?? listing.treasuryRequired;
									listing.description = this.execute.getVariable('description') ?? listing.description;
									listing.duration = this.execute.getVariable('duration') ?? listing.duration;
									listing.stock = this.execute.getVariable('stock') ?? listing.stock;
									listing.stackable = this.execute.getVariable('stackable') ?? listing.stackable;
									listing.itemsRequired = this.execute.getVariable('items required') ?? listing.itemsRequired;
									listing.rolesRequired = this.execute.getVariable('roles required') ?? listing.rolesRequired;
									listing.rolesGranted = this.execute.getVariable('roles granted') ?? listing.rolesGranted;
									listing.rolesRemoved = this.execute.getVariable('roles removed') ?? listing.rolesRemoved;
									if (listing.type === 'GENERATOR') {
										listing.generatorAmount = this.execute.getVariable('generator amount') ?? listing.generatorAmount;
										listing.generatorPeriod = this.execute.getVariable('generator period') ?? listing.generatorPeriod;
									}

									return new ExecutionBuilder()
										.setEmbed(displayListing(ctx, listing))
										.setOptions([
											new ExecutionBuilder()
												.setName('Cancel')
												.setValue('cancel')
												.setDescription('Cancel this listing')
												.setEmbed(ctx.embedify('warn', 'user', `${Emojis.CROSS} **Shop Listing Edit Cancelled**`)),
											new ExecutionBuilder()
												.setName('Update')
												.setValue('update')
												.setDescription('Update this listing')
												.setExecution(async (ctx, interaction) => {
													await listing.save();
													await interaction.update({ embeds: [ctx.embedify('success', 'user', `${Emojis.DEED} **Shop Listing Edited Successfully**`)] });
												}),
										]);
								}),
							new ExecutionBuilder()
								.setName('Delete Listing')
								.setValue('delete')
								.setDescription('Delete this listing from the shop')
								.setPermissions(['ManageGuild'])
								.setExecution(async (ctx, interaction) => {
									const affectedMembers = await Item.findBy({ listing: { id: listing.id } });
									const embed = ctx.embedify('warn', 'guild', `Deleting this listing will remove items from \`${affectedMembers.length}\` inventories.`);
									const row = new ActionRowBuilder<ButtonBuilder>()
										.setComponents([
											new ButtonBuilder()
												.setCustomId('listing_cancel')
												.setLabel('Cancel')
												.setStyle(ButtonStyle.Secondary),
											new ButtonBuilder()
												.setCustomId('listing_delete')
												.setLabel('Delete')
												.setStyle(ButtonStyle.Danger),
										]);

									const message = await interaction.update({ embeds: [embed], components: [row] });
									const action = await message.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
									if (action.customId === 'listing_cancel') {
										const cancelEmbed = ctx.embedify('warn', 'user', `${Emojis.CROSS} **Shop Listing Deletion Cancelled**`);
										await action.update({ embeds: [cancelEmbed], components: [] });
									} else if (action.customId === 'listing_delete') {
										await listing.remove();
										const successEmbed = ctx.embedify('success', 'user', `${Emojis.DEED} **Shop Listing Deleted Successfully**`);
										await action.update({ embeds: [successEmbed], components: [] });
									}
								}),
						]),
				),
			new ExecutionBuilder()
				.setName('Manage')
				.setValue('manage')
				.setDescription('Manage the local server shop')
				.setPermissions(['ManageGuild'])
				.setOptions([
					new ExecutionBuilder()
						.setName('Create Shop Listing')
						.setValue('create')
						.setDescription('Create a new shop listing')
						.setOptions([
							new ExecutionBuilder()
								.setName('Collectable')
								.setValue('collectable')
								.setDescription('Create a collectable shop item.')
								.setExecution(() => this.itemCreator()),
							new ExecutionBuilder()
								.setName('Instant')
								.setValue('instant')
								.setDescription('Create an instant shop item.')
								.setExecution(() => this.itemCreator()),
							new ExecutionBuilder()
								.setName('Usable')
								.setValue('usable')
								.setDescription('Create a usable shop item.')
								.setExecution(() => this.itemCreator()),
							new ExecutionBuilder()
								.setName('Generator')
								.setValue('generator')
								.setDescription('Create a generator shop item.')
								.collectVar({
									property: 'generator amount',
									prompt: 'The amount generated per iteration.',
									validators: [{ function: (ctx, input) => !!parseString(input), error: 'Input must be numerical' }],
									parse: (ctx, input) => parseString(input),
								})
								.collectVar({
									property: 'generator period',
									prompt: 'The duration between generation.',
									validators: [{ function: (ctx, input) => !!ms(input), error: 'Input must be valid duration' }],
									parse: (ctx, input) => ms(input),
								})
								.setExecution(() => this.itemCreator()),
						]),
				]),
		]);

	private itemCreator = async () => new ExecutionBuilder()
		.collectVar({
			property: 'name',
			prompt: "Specify the listing's name.",
			validators: [{ function: (ctx, input) => !!input, error: 'Could not parse input' }],
			parse: (ctx, input) => input,
		})
		.collectVar({
			property: 'price',
			prompt: 'The wallet balance required to purchase.',
			validators: [{ function: (ctx, input) => parseString(input) !== null, error: 'Input must be numerical' },
				{ function: (ctx, input) => parseString(input) > 0, error: 'Input must be positive.' }],
			parse: (ctx, input) => parseString(input),
		})
		.collectVar({
			property: 'required treasury',
			prompt: 'The minimum treasury balance to purchase.',
			validators: [{ function: (ctx, input) => !!parseString(input), error: 'Input must be numerical' },
				{ function: (ctx, input) => parseString(input) > 0, error: 'Input must be positive.' }],
			parse: (ctx, input) => parseString(input),
			skippable: true,
		})
		.collectVar({
			property: 'description',
			prompt: 'Give a short description.',
			validators: [{ function: (ctx, input) => !!input, error: 'Could not parse input.' }],
			parse: (ctx, input) => input,
			skippable: true,
		})
		.collectVar({
			property: 'duration',
			prompt: 'Specify how long this listing is available.',
			validators: [{ function: (ctx, input) => !!ms(input), error: 'Input must be a valid duration. Ex) 1m, 4d' }],
			parse: (ctx, input) => ms(input),
			skippable: true,
		})
		.collectVar({
			property: 'stock',
			prompt: 'Specify how many of this listing are to be sold.',
			validators: [{ function: (ctx, input) => !!parseString(input), error: 'Input must be numerical.' }],
			parse: (ctx, input) => parseString(input),
			skippable: true,
		})
		.collectVar({
			property: 'stackable',
			prompt: 'Whether users can own multiple of this listing.',
			validators: [{ function: (ctx, input) => ['false', 'true'].includes(input.toLowerCase()), error: 'Input must be one of `false` or `true`' }],
			parse: (ctx, input) => input.toLowerCase() === 'true',
			skippable: true,
		})
		.collectVar({
			property: 'required items',
			prompt: 'Items required to own in order to purchase.',
			validators: [{ function: async (ctx, input) => !!(await Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(input) })).length, error: 'Could not find that item in the market' }],
			parse: async (ctx, input) => Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(input) }),
			skippable: true,
		})
		.collectVar({
			property: 'required roles',
			prompt: 'Roles required to own in order to purchase.',
			validators: [{ function: (ctx, input) => ctx.interaction.guild.roles.cache.has(input), error: 'Could not find that role' }],
			parse: (ctx, input) => [input],
			skippable: true,
		})
		.collectVar({
			property: 'granted roles',
			prompt: 'Roles granted upon purchase.',
			validators: [{ function: (ctx, input) => ctx.interaction.guild.roles.cache.has(input), error: 'Could not find that role' }],
			parse: (ctx, input) => [input],
			skippable: true,
		})
		.collectVar({
			property: 'removed roles',
			prompt: 'Roles removed upon purchase.',
			validators: [{ function: (ctx, input) => ctx.interaction.guild.roles.cache.has(input), error: 'Could not find that role' }],
			parse: (ctx, input) => [input],
			skippable: true,
		})

		.setExecution(async (ctx, interaction) => {
			const listing = new Listing();
			listing.guild = ctx.guildEntity;
			listing.createdAt = new Date();
			listing.active = true;

			listing.name = this.execute.getVariable('name');
			listing.price = this.execute.getVariable('price');
			listing.type = this.execute.getVariable('type');
			listing.treasuryRequired = this.execute.getVariable('required treasury') ?? 0;
			listing.description = this.execute.getVariable('description') ?? 'No description.';
			listing.duration = this.execute.getVariable('duration') ?? Infinity;
			listing.stock = this.execute.getVariable('stock') ?? Infinity;
			listing.stackable = this.execute.getVariable('stackable') ?? false;
			listing.itemsRequired = this.execute.getVariable('items required') ?? [];
			listing.rolesRequired = this.execute.getVariable('roles required') ?? [];
			listing.rolesGranted = this.execute.getVariable('roles granted') ?? [];
			listing.rolesRemoved = this.execute.getVariable('roles removed') ?? [];
			if (listing.type === 'GENERATOR') {
				listing.generatorAmount = this.execute.getVariable('generator amount');
				listing.generatorPeriod = this.execute.getVariable('generator period');
			}

			const listingEmbed = displayListing(ctx, listing);
			const row = new ActionRowBuilder<ButtonBuilder>()
				.setComponents([
					new ButtonBuilder()
						.setCustomId('listing_cancel')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setCustomId('listing_create')
						.setLabel('Create')
						.setStyle(ButtonStyle.Success),
				]);

			const message = await interaction.editReply({ embeds: [listingEmbed], components: [row] });
			const action = await message.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
			if (action.customId === 'listing_cancel') {
				const cancelEmbed = ctx.embedify('warn', 'user', `${Emojis.CROSS} **Shop Listing Cancelled**`);
				await action.update({ embeds: [cancelEmbed], components: [] });
			} else if (action.customId === 'listing_create') {
				await listing.save();
				const successEmbed = ctx.embedify('success', 'user', `${Emojis.DEED} **Shop Listing Created Successfully**`);
				await action.update({ embeds: [successEmbed], components: [] });
			}
		});
}
