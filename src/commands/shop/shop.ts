import { parseInteger, parseNumber, parseString } from '@adrastopoulos/number-parser';
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
								.setExecution(() => this.itemCreator(this.execute)),
							new ExecutionBuilder()
								.setName('Instant')
								.setValue('instant')
								.setDescription('Create an instant shop item.')
								.setExecution(() => this.itemCreator(this.execute)),
							new ExecutionBuilder()
								.setName('Usable')
								.setValue('usable')
								.setDescription('Create a usable shop item.')
								.setExecution(() => this.itemCreator(this.execute)),
							new ExecutionBuilder()
								.setName('Generator')
								.setValue('generator')
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
									.setParser((msg) => ms(msg.content)))
								.setExecution(() => this.itemCreator(this.execute)),
						]),
				]),
		]);

	private itemCreator = async (ex: ExecutionBuilder) => new ExecutionBuilder()
		.collectVar((collector) => collector
			.setProperty('name')
			.setPrompt('The listing name.')
			.setParser((msg) => msg.content))
		.collectVar((collector) => collector
			.setProperty('price')
			.setPrompt('The minimum wallet balance required to purchase.')
			.addValidator((msg) => parseString(msg.content) !== null, 'Input must be numerical.')
			.addValidator((msg) => parseString(msg.content) >= 0, 'Input must be positive')
			.setParser((msg) => parseString(msg.content)))
		.collectVar((collector) => collector
			.setProperty('required treasury')
			.setPrompt('The minimum treasury balance required to purchase.')
			.addValidator((msg) => parseString(msg.content) !== null, 'Input must be numerical.')
			.addValidator((msg) => parseString(msg.content) >= 0, 'Input must be positive')
			.setParser((msg) => parseString(msg.content))
			.setSkippable())
		.collectVar((collector) => collector
			.setProperty('description')
			.setPrompt('The listing description.')
			.setParser((msg) => msg.content))
		.collectVar((collector) => collector
			.setProperty('duration')
			.setPrompt('How long this listing is available.')
			.addValidator((msg) => !!ms(msg.content), 'Input must be a valid duration.')
			.setParser((msg) => ms(msg.content))
			.setSkippable())
		.collectVar((collector) => collector
			.setProperty('stock')
			.setPrompt('How many of this listing can be sold.')
			.addValidator((msg) => parseInteger(msg.content) !== null, 'Input must be numerical.')
			.addValidator((msg) => parseInteger(msg.content) >= 0, 'Input must be positive')
			.setParser((msg) => parseInteger(msg.content))
			.setSkippable())
		.collectVar((collector) => collector
			.setProperty('stackable')
			.setPrompt('Whether users can own multiple items.')
			.addValidator((msg) => ['false', 'true'].includes(msg.content.toLowerCase()), 'Input must be one of `false`, `true`.')
			.setParser((msg) => msg.content.toLowerCase() === 'true')
			.setSkippable())
		.collectVar((collector) => collector
			.setProperty('required items')
			.setPrompt('Items required to own in order to purchase.')
			.addValidator(async (msg, ctx) => !!(await Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(msg.content) })).length, 'Could not find that item in the market.')
			.setParser(async (msg, ctx) => Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(msg.content) }))
			.setSkippable())
		.collectVar((collector) => collector
			.setProperty('required roles')
			.setPrompt('Roles required to own in order to purchase.')
			.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
			.setParser((msg) => Array.from(msg.mentions.roles.values()))
			.setSkippable())
		.collectVar((collector) => collector
			.setProperty('granted roles')
			.setPrompt('Roles granted upon purchasing.')
			.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
			.setParser((msg) => Array.from(msg.mentions.roles.values()))
			.setSkippable())
		.collectVar((collector) => collector
			.setProperty('removed roles')
			.setPrompt('Roles removed upon purchasing.')
			.addValidator((msg) => !!msg.mentions.roles.size, 'No roles mentioned.')
			.setParser((msg) => Array.from(msg.mentions.roles.values()))
			.setSkippable())
		.setExecution(async (ctx, interaction) => {
			const listing = new Listing();
			listing.guild = ctx.guildEntity;
			listing.createdAt = new Date();
			listing.active = true;

			listing.name = ex.getVariable('name');
			listing.price = ex.getVariable('price');
			listing.type = ex.getVariable('type');
			listing.treasuryRequired = ex.getVariable('required treasury') ?? 0;
			listing.description = ex.getVariable('description') ?? 'No description.';
			listing.duration = ex.getVariable('duration') ?? Infinity;
			listing.stock = ex.getVariable('stock') ?? Infinity;
			listing.stackable = ex.getVariable('stackable') ?? false;
			listing.itemsRequired = ex.getVariable('items required') ?? [];
			listing.rolesRequired = ex.getVariable('roles required') ?? [];
			listing.rolesGranted = ex.getVariable('roles granted') ?? [];
			listing.rolesRemoved = ex.getVariable('roles removed') ?? [];
			if (listing.type === 'GENERATOR') {
				listing.generatorAmount = ex.getVariable('generator amount');
				listing.generatorPeriod = ex.getVariable('generator period');
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
