import {
	Emojis,
	ListingDescriptions,
	ListingEmojis,
	ListingType
} from '@economica/common';
import {
	datasource,
	Guild,
	isGenerator,
	Item,
	Listing,
	Member
} from '@economica/db';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	InteractionReplyOptions,
	parseEmoji,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputStyle
} from 'discord.js';
import ms from 'ms';
import { z } from 'zod';
import { recordTransaction } from '../lib';
import { parseInteger, parseNumber } from '../lib/economy';
import { Command } from '../structures/commands';

export const Shop = {
	identifier: /^shop$/,
	type: 'chatInput',
	execute: async (interaction) =>
		ShopPage.execute(interaction, undefined as never)
} satisfies Command<'chatInput'>;

export const ShopPage = {
	identifier: /^shop_page:(?<user>(.*)):(?<page>(.*))$/,
	type: 'button',
	execute: async (interaction, args) => {
		let page: number;
		if (interaction.isChatInputCommand())
			page = interaction.options.getInteger('page') ?? 1;
		else page = +args.groups.page;

		const limit = 2;

		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const listings = await datasource.getRepository(Listing).find({
			take: limit,
			skip: (page - 1) * limit,
			where: { guild: { id: interaction.guildId } }
		});
		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Browsing the local server shop`,
				iconURL: interaction.guild.iconURL() ?? undefined
			})
			.addFields(
				listings.map((listing) => ({
					name: `${listing.name} | ${guildEntity.currency} \`${parseNumber(
						listing.price
					)}\``,
					value: `>>> *${listing.description}*`
				}))
			);
		const selects =
			new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
				new StringSelectMenuBuilder()
					.setCustomId(`shop_item:${interaction.user.id}`)
					.setOptions(
						listings.map((listing) =>
							new StringSelectMenuOptionBuilder()
								.setLabel(listing.name)
								.setValue(`shop_item:${listing.id}`)
						)
					)
			);
		const paginators = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setCustomId(`shop_page:${interaction.user.id}:${page - 1}`)
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				.setEmoji({ id: parseEmoji(Emojis.PREVIOUS)!.id! })
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`shop_page:${interaction.user.id}:${page + 1}`)
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				.setEmoji({ id: parseEmoji(Emojis.NEXT)!.id! })
				.setStyle(ButtonStyle.Primary)
				.setDisabled(listings.length < limit)
		);
		const messagePayload: Omit<InteractionReplyOptions, 'flags'> = {
			embeds: [embed],
			components: [paginators]
		};
		if (selects.components.at(0)?.options.length)
			messagePayload.components?.push(selects);
		interaction.isChatInputCommand()
			? await interaction.reply(messagePayload)
			: await interaction.update(messagePayload);
	}
} satisfies Command<'button' | 'chatInput', 'user' | 'page'>;

export const ShopItem = {
	identifier: /^shop_item:(?<item>(.*))$/,
	type: 'selectMenu',
	execute: async (interaction, args) => {
		const listing = await datasource
			.getRepository(Listing)
			.findOneByOrFail({ id: args.groups.item });
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		await interaction.update({
			embeds: [
				{
					author: {
						name: `${listing.name} - ${listing.description}`,
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						icon_url: interaction.client.emojis.resolve(
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							parseEmoji(Emojis.BOX)!.id!
						)!.url
					},
					description: `**Id**: \`${
						listing.id
					}\` | **Created**: ${listing.createdAt.toLocaleString()} | **Expires**: ${`${
						listing.duration === null
							? '`Never`'
							: `<t:${Math.trunc(
									(new Date(listing.createdAt).getTime() + listing.duration) /
										1000
							  )}:R>`
					}`}`,
					fields: [
						{
							name: `${Emojis.MONEY_STACK} Price`,
							value: `${guildEntity.currency} \`${parseNumber(
								listing.price
							)}\``,
							inline: true
						},
						{
							name: `${Emojis.MONEY_BAG} Required Treasury`,
							value: `${guildEntity.currency} \`${parseNumber(
								listing.treasuryRequired
							)}\``,
							inline: true
						},
						{
							name: `${Emojis.BACKPACK} Items required`,
							value: listing.itemsRequired.length
								? listing.itemsRequired
										.map((item) => `\`${item.name}\``)
										.join('\n')
								: '`None`',
							inline: true
						},
						{
							name: `${Emojis.STACK} Stackable`,
							value: `\`${listing.stackable}\``,
							inline: true
						},
						{
							name: `${Emojis.TREND} Active`,
							value: `\`${listing.active}\``,
							inline: true
						},
						{
							name: `${Emojis.TILES} In Stock`,
							value: `\`${!listing.stock || listing.stock > 0}\``,
							inline: true
						},
						{
							name: `${Emojis.KEY} Roles Required`,
							value: listing.rolesRequired.length
								? listing.rolesRequired.map((role) => `<@&${role}>`).join('\n')
								: '`None`',
							inline: true
						},
						{
							name: `${Emojis.RED_DOWN_ARROW} Roles Removed`,
							value: listing.rolesRemoved.length
								? listing.rolesRemoved.map((role) => `<@&${role}>`).join('\n')
								: '`None`',
							inline: true
						},
						{
							name: `${Emojis.GREEN_UP_ARROW} Roles Granted`,
							value: listing.rolesGranted.length
								? listing.rolesGranted.map((role) => `<@&${role}>`).join('\n')
								: '`None`',
							inline: true
						},
						{
							name: `${ListingEmojis[listing.type]} \`${listing.type}\` Item`,
							value: `>>> ${ListingDescriptions[listing.type]}`
						},
						...(isGenerator(listing)
							? [
									{
										name: 'Generator Period',
										value: `\`${ms(listing.generatorPeriod)}\``,
										inline: true
									},
									{
										name: 'Generator Amount',
										value: `${guildEntity.currency} \`${parseNumber(
											listing.generatorAmount
										)}\``,
										inline: true
									}
							  ]
							: [])
					]
				}
			],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: 'Edit',
							style: ButtonStyle.Primary,
							custom_id: `shop_item_edit:${interaction.user.id}:${listing.id}`,
							disabled: true
						},
						{
							type: ComponentType.Button,
							label: 'Delete',
							style: ButtonStyle.Danger,
							custom_id: `shop_item_delete:${interaction.user.id}:${listing.id}`,
							disabled: !interaction.member.permissions.has('Administrator')
						},
						{
							type: ComponentType.Button,
							label: 'Purchase',
							style: ButtonStyle.Success,
							custom_id: `shop_item_buy:${interaction.user.id}:${listing.id}`
						}
					]
				}
			]
		});
	}
} satisfies Command<'selectMenu', 'item'>;

// export const ShopItemEdit = {
// 	identifier: /^shop_item_edit:(?<userId>(.*)):(?<listingId>(.*))/,
// 	type: 'button',
// 	execute: async(interaction, args) => {

// 	}
// } satisfies Command<'button', 'userId' | 'listingId'>;

export const ShopItemDelete = {
	identifier: /^shop_item_delete:(?<userId>(.*)):(?<listingId>(.*))$/,
	type: 'button',
	execute: async (interaction, args) => {
		const listing = await datasource
			.getRepository(Listing)
			.findOneByOrFail({ id: args.groups.listingId });
		const items = await datasource.getRepository(Item).findBy({
			listing: { id: args.groups.listingId }
		});
		await datasource.getRepository(Listing).delete({ id: listing.id });
		await interaction.update({
			embeds: [
				{
					author: { name: `Deleting ${listing.name}...` },
					description: `${
						Emojis.CROSS
					} **Shop Listing Deleted**\nRemoved \`${items.reduce(
						(prev, curr) => prev + curr.amount,
						0
					)}\` items from \`${items.length}\` inventories.`
				}
			],
			components: []
		});
	}
} satisfies Command<'button', 'userId' | 'listingId'>;

export const ShopItemBuy = {
	identifier: /^shop_item_buy:(?<userId>(.*)):(?<listingId>(.*))/,
	type: 'button',
	execute: async (interaction, args) => {
		await interaction.showModal({
			title: 'Specify amount',
			custom_id: `shop_item_buy_amount:${interaction.user.id}:${args.groups.listingId}`,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							label: 'Amount',
							custom_id: 'amount',
							type: ComponentType.TextInput,
							style: TextInputStyle.Short,
							required: true
						}
					]
				}
			]
		});
	}
} satisfies Command<'button', 'userId' | 'listingId'>;

export const ShopItemBuyConfirm = {
	identifier: /^shop_item_buy_amount:(?<userId>(.*)):(?<listingId>(.*))$/,
	type: 'modal',
	execute: async (interaction, args) => {
		const amount = interaction.fields.getTextInputValue('amount');
		const listing = await datasource
			.getRepository(Listing)
			.findOneByOrFail({ id: args.groups.listingId });
		if (!listing) throw new Error('Could not find listing :(');
		const memberEntity = await datasource
			.getRepository(Member)
			.findOneByOrFail({
				userId: interaction.user.id,
				guildId: interaction.guildId
			});
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const existingItem = await datasource.getRepository(Item).findOneBy({
			listing: { id: args.groups.listingId },
			owner: { userId: interaction.user.id, guildId: interaction.guildId }
		});

		const parsedAmount = z
			.string()
			.transform((val) => parseInteger(val))
			.pipe(z.number().positive())
			.parse(amount);

		// Validation
		const missingItems: Listing[] = [];
		for await (const item of listing.itemsRequired) {
			const memberItem = await datasource.getRepository(Item).findOneBy({
				owner: {
					userId: interaction.user.id,
					guildId: interaction.guildId
				},
				listing: { id: item.id }
			});
			if (!memberItem) missingItems.push(item);
		}

		const missingRoles: string[] = [];
		listing.rolesRequired.forEach(async (role) => {
			if (!interaction.member.roles.cache.has(role)) missingRoles.push(role);
		});

		if (!listing.active) throw new Error('This listing is **not active**.');
		if (listing.stock && listing.stock < parsedAmount)
			throw new Error('This listing is **out of stock**.');
		if (!listing.stackable && existingItem)
			throw new Error('You **already own** this item.');
		if (missingItems.length)
			throw new Error(
				`You must own ${missingItems
					.map((item) => `\`${item.name}\``)
					.join(', ')} to purchase this listing.`
			);
		if (missingRoles.length)
			throw new Error(
				`You must have the roles ${missingRoles
					.map((role) => `<@&${role}>`)
					.join(', ')} to buy this item.`
			);
		if (listing.treasuryRequired > memberEntity.treasury)
			throw new Error(
				`You must have a **treasury balance** of ${guildEntity.currency} \`${listing.treasuryRequired}\` to purchase this listing.`
			);
		if (listing.price * parsedAmount > memberEntity.wallet)
			throw new Error(`You **cannot afford** \`${amount}\` of this item.`);

		// Purchase complete
		if (listing.stock) {
			await datasource.getRepository(Listing).update(
				{
					id: listing.id
				},
				{
					stock: listing.stock - parsedAmount
				}
			);
		}

		if (existingItem) {
			await datasource.getRepository(Item).update(
				{
					id: existingItem.id
				},
				{
					amount: existingItem.amount + parsedAmount
				}
			);
		} else {
			listing.rolesGranted.forEach((role) =>
				interaction.member.roles.add(role, `Purchased ${listing.name}`)
			);
			listing.rolesRemoved.forEach((role) =>
				interaction.member.roles.remove(role, `Purchased ${listing.name}`)
			);

			if (listing.type !== ListingType.INSTANT) {
				await datasource.getRepository(Item).save({
					amount: parsedAmount,
					listing: { id: listing.id },
					owner: { userId: interaction.user.id, guildId: interaction.guildId }
				});
			}
		}

		await recordTransaction(
			interaction.guildId,
			interaction.user.id,
			interaction.client.user.id,
			'BUY',
			-(listing.price * parsedAmount),
			0
		);

		await interaction.update({
			embeds: [
				{
					author: { name: `Purchasing ${parsedAmount} x ${listing.name}` },
					description: `${Emojis.CHECK} **Listing Purchased Successfully**`
				}
			],
			components: []
		});
	}
} satisfies Command<'modal', 'userId' | 'listingId'>;
