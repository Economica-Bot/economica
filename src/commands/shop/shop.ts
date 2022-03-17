/* eslint-disable no-param-reassign */
import { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType } from 'discord.js';

import { Listing } from '../../entities/index.js';
import { embedifyListing } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { BUTTON_INTERACTION_COOLDOWN, Emojis } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription('Interact with the shop.')
		.setModule('SHOP')
		.setFormat('shop')
		.setExamples(['shop'])
		.addStringOption((o) => o
			.setName('item')
			.setDescription('The name of the item to view. Omit to view entire shop.'));

	public execute = async (ctx: Context) => {
		const query = ctx.interaction.options.getString('item');
		const listings = await Listing.find({ where: { guild: ctx.guildEntity } });
		const listing = listings.find((l) => l.name === query);
		if (query && !listing) {
			await ctx.embedify('error', 'user', `Could not find listing named \`${query}\``).send(true);
			return;
		}

		if (listing) {
			const description = listing.toString();
			await ctx.embedify('info', 'user', description).send();
			return;
		}

		const components = [
			new ButtonBuilder()
				.setCustomId('create-item')
				.setLabel('Create Item')
				.setStyle(ButtonStyle.Primary)
				.setEmoji({ id: Emojis.ADD }),
			new ButtonBuilder()
				.setCustomId('delete-all-items')
				.setLabel('Delete All')
				.setStyle(ButtonStyle.Primary),
		];

		const maxEntries = 10;
		const pageCount = listings.length / maxEntries || 1;
		const embeds: EmbedBuilder[] = [];
		let k = 0;
		for (let i = 0; i < pageCount; i++) {
			const embed = ctx.embedify('info', 'guild', `Welcome to ${ctx.client.user}'s shop!`);
			for (let j = 0; j < maxEntries; j++, k++) {
				if (listings[k]) embed.addFields({ name: listings[k].name, value: `${ctx.guildEntity.currency}${listing.price}\n*${listing.description}*`, inline: true });
			}

			embeds.push(embed);
		}

		/* const filter = (i: ButtonInteraction): boolean => i.user.id === ctx.interaction.user.id;

		const collector = msg.createMessageComponentCollector({
			filter,
			time: BUTTON_INTERACTION_COOLDOWN,
		});

		collector.on('collect', async () => {
			collector.resetTimer();
		}); */
		/* if (subcommand === 'buy') {
			const errors: string[] = [];
			if (!listing.active) errors.push('This listing is no longer active');
			if (listing.price > ctx.memberEntity.wallet) errors.push(`You cannot afford this item. Current wallet balance: ${ctx.guildEntity.currency}${ctx.memberEntity.wallet}`);
			if (listing.treasuryRequired > ctx.memberEntity.treasury) errors.push(`Insufficient treasury balance. You need at least ${ctx.guildEntity.currency}${listing.treasuryRequired}`);
			listing.rolesRequired.forEach(async (role) => {
				if (!ctx.interaction.member.roles.cache.has(role)) errors.push(`You are missing the <@!${role}> role`);
			});
			(await listing.itemsRequired).forEach(async (item) => {
				if (!(await Item.findOne({ owner: ctx.memberEntity, listing: item }))) errors.push(`You need a \`${item.name}\` to purchase this listing`);
			});
			const item = await Item.findOne({ owner: ctx.memberEntity, listing });
			if (item && !listing.stackable) errors.push('This item is not stackable');
			if (errors.length) {
				await ctx.embedify('warn', 'user', errors.join('\n')).send(true);
				return;
			}

			await ctx.embedify('success', 'user', `Purchased \`${listing.name}\``).send();
			if (listing.type === 'INSTANT') {
				listing.rolesRemoved.forEach(async (role) => ctx.interaction.member.roles.remove(role));
				listing.rolesGiven.forEach(async (role) => ctx.interaction.member.roles.add(role));
			}

			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BUY', -listing.price, 0);
			if (item) {
				item.amount += 1;
				await item.save();
			} else {
				const newItem = await Item.create({ listing, owner: ctx.memberEntity, amount: 1 });
				if (newItem.listing.type === 'GENERATOR') newItem.lastGeneratedAt = new Date();
				await newItem.save();
			}
		} */
	};

	private async displayShop(
		ctx: Context,
		embeds: EmbedBuilder[],
		index = 0,
		components?: ButtonBuilder[],
	) {
		const { interaction } = ctx;

		if (!interaction.deferred) {
			await interaction.deferReply();
		}

		setTimeout(() => interaction.editReply({
			components: [],
		}), BUTTON_INTERACTION_COOLDOWN);

		const row = new ActionRowBuilder<ButtonBuilder>()
			.setComponents(
				new ButtonBuilder().setCustomId('previous_page').setLabel('Previous').setStyle(ButtonStyle.Secondary).setDisabled(index === 0),
				new ButtonBuilder().setCustomId('next_page').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(index === embeds.length - 1),
				...components,
			);

		const msg = (await interaction.editReply({
			embeds: [embeds[index]],
			components: [row],
		})) as Message;

		const i = await msg.awaitMessageComponent({
			componentType: ComponentType.Button,
		});

		if (index < embeds.length - 1 && index >= 0 && i.customId === 'next_page') {
			index += 1;
		} else if (index > 0 && index < embeds.length && i.customId === 'previous_page') {
			index -= 1;
		} else if (i.customId === 'create-item') {
			embeds = [
				await embedifyListing(ctx, null),
			];

			await this.displayShop(ctx, embeds, index, components);
		}
	}
}
