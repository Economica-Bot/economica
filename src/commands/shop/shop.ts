/* eslint-disable no-param-reassign */
import { EmbedBuilder } from 'discord.js';

import { Listing } from '../../entities/index.js';
import { displayListing } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription('Interact with the shop.')
		.setModule('SHOP')
		.setFormat('shop')
		.setExamples(['shop'])
		.setAuthority('USER')
		.setDefaultPermission(false)
		.addStringOption((o) => o
			.setName('query')
			.setDescription('Specify a listing'));

	public execute = async (ctx: Context) => {
		const query = ctx.interaction.options.getString('query', false);
		const listings = await Listing.find({ guild: ctx.guildEntity });
		const listing = listings.find((l) => l.name === query);
		if (query && !listing) {
			await ctx.embedify('error', 'user', `Could not find listing named \`${query}\``).send(true);
			return;
		}

		if (listing) {
			const embed = await displayListing(ctx, listing);
			await ctx.interaction.reply({ embeds: [embed] });
			return;
		}

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
}
