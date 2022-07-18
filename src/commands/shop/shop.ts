import { parseNumber } from '@adrastopoulos/number-parser';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

import { Item, Listing } from '../../entities';
import { displayListing, editListing, recordTransaction } from '../../lib';
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
								.setExecution(async (ctx, interaction) => {
									await editListing(ctx, interaction, listing, true);
									const listingEmbed = displayListing(ctx, listing);
									const row = new ActionRowBuilder<ButtonBuilder>()
										.setComponents([
											new ButtonBuilder()
												.setCustomId('listing_edit_cancel')
												.setLabel('Cancel')
												.setStyle(ButtonStyle.Danger),
											new ButtonBuilder()
												.setCustomId('listing_edit_update')
												.setLabel('Update')
												.setStyle(ButtonStyle.Success),
										]);

									const message = await interaction.editReply({ embeds: [listingEmbed], components: [row] });
									const action = await message.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
									if (action.customId === 'listing_edit_cancel') {
										const cancelEmbed = ctx.embedify('warn', 'user', `${Emojis.CROSS} **Shop Listing Edit Cancelled**`);
										await action.update({ embeds: [cancelEmbed], components: [] });
									} else if (action.customId === 'listing_edit_update') {
										await listing.save();
										const successEmbed = ctx.embedify('success', 'user', `${Emojis.DEED} **Shop Listing Edited Successfully**`);
										await action.update({ embeds: [successEmbed], components: [] });
									}
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
						.setExecution(async (ctx, interaction) => {
							const listing = new Listing();
							listing.guild = ctx.guildEntity;
							listing.createdAt = new Date();
							listing.active = true;

							await editListing(ctx, interaction, listing);

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
						}),
				]),
		]);
}
