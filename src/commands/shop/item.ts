import { parseNumber } from '@adrastopoulos/number-parser';

import { Item, Listing, Member } from '../../entities/index.js';
import { recordTransaction } from '../../lib/transaction.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('item')
		.setDescription('Interact with inventory items')
		.setModule('SHOP')
		.setFormat('item <sell | use | give>')
		.setExamples(['item'])
		.addSubcommand((subcommand) => subcommand
			.setName('sell')
			.setDescription('Sell an item')
			.addStringOption((option) => option
				.setName('item').setDescription('Specify an item').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('use')
			.setDescription('Use an item')
			.addStringOption((option) => option
				.setName('item').setDescription('Specify an item').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('give')
			.setDescription('Give an item away')
			.addStringOption((option) => option
				.setName('item').setDescription('Specify an item').setRequired(true))
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Specify a user')
				.setRequired(true))
			.addIntegerOption((option) => option
				.setName('amount')
				.setDescription('Specify the amount')
				.setMinValue(1)));

	public execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const query = ctx.interaction.options.getString('name', false);
		const listing = await Listing.findOne({ where: { guild: { id: ctx.guildEntity.id }, name: query } });
		const item = await Item.findOne({ where: { id: listing.id, owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId } } });
		if (subcommand === 'buy') {
			if (!listing) {
				await ctx.embedify('error', 'user', `Could not find a listing called \`${query}\``).send(true);
				return;
			}
			if (!listing.active) {
				await ctx.embedify('error', 'user', `The listing \`${listing.name}\` is not active`).send(true);
				return;
			}

			const missingRoles = new Array<string>();
			const missingItems = new Array<string>();
			listing.rolesRequired.forEach((role) => {
				if (!ctx.interaction.member.roles.cache.has(role)) missingRoles.push(role);
			});
			(await listing.itemsRequired).forEach(async (sublisting) => {
				const hasSublisting = await Item.find({ where: { id: sublisting.id, owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId } } });
				if (!hasSublisting) missingItems.push(sublisting.name);
			});
			if (listing.price > ctx.memberEntity.wallet) {
				await ctx.embedify('warn', 'user', 'You cannot afford this item.').send(true);
				return;
			} if (listing.treasuryRequired > ctx.memberEntity.treasury) {
				await ctx.embedify('warn', 'user', `You need ${ctx.guildEntity.currency}${parseNumber(listing.treasuryRequired)} in your treasury.`).send(true);
				return;
			} if (missingItems.length) {
				await ctx.embedify('warn', 'user', `You are missing \`${missingItems.join('`, `')}\`.`).send(true);
				return;
			} if (missingRoles.length) {
				await ctx.embedify('warn', 'user', `You are missing <@&${missingRoles.join('>, <@&')}>.`).send(true);
				return;
			} if (item && !listing.stackable) {
				await ctx.embedify('warn', 'user', 'This item is not stackable.').send(true);
				return;
			}

			await ctx.embedify('success', 'user', `Purchased \`${listing.name}\` for ${ctx.guildEntity.currency}${parseNumber(listing.price)}`).send();
			if (listing.type === 'INSTANT') {
				listing.rolesRemoved.forEach(async (role) => ctx.interaction.member.roles.remove(role, `Purchased ${listing.name}`));
				listing.rolesGiven.forEach((roleId) => ctx.interaction.member.roles.add(roleId, `Purchased ${listing.name}`));
			}

			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BUY', -listing.price, 0);
			if (item) {
				item.amount += 1;
				await item.save();
			} else await Item.create({ owner: ctx.memberEntity, listing, amount: 1 }).save();
			listing.stock -= 1;
			await listing.save();
		} else if (subcommand === 'sell') {
			if (!listing) {
				await ctx.embedify('error', 'user', `Could not find a listing called \`${query}\``).send(true);
				return;
			}
			if (!listing.active) {
				await ctx.embedify('error', 'user', `The listing \`${listing.name}\` is not active`).send(true);
				return;
			}

			await ctx.embedify('success', 'user', `Sold \`${listing.name}\` for ${ctx.guildEntity.currency}${parseNumber(listing.price)}`).send();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'SELL', listing.price, 0);
			item.amount -= 1;
			await item.save();
			if (item.amount === 0) await item.remove();
			listing.stock += 1;
			listing.save();
		} else if (subcommand === 'use') {
			if (!item) {
				await ctx.embedify('error', 'user', `No item with name \`${query}\` exists.`).send(true);
				return;
			}
			if (item.listing.type !== 'USABLE') {
				await ctx.embedify('error', 'user', 'This item is unusable.').send(true);
				return;
			}

			const embed = ctx.embedify('success', 'user', `Used \`${item.listing.name}\` x1`);
			item.listing.rolesGiven.forEach((role) => { ctx.interaction.member.roles.add(role, `Purchased ${item.listing.name}`); });
			embed.addFields([{ name: 'Roles Given', value: `<@&${item.listing.rolesGiven.join('>, <@&')}>` }]);
			item.listing.rolesRemoved.forEach((role) => { ctx.interaction.member.roles.remove(role, `Purchased ${item.listing.name}`); });
			embed.addFields([{ name: 'Roles Removed', value: `<@&${item.listing.rolesRemoved.join('>, <@&')}>` }]);

			await ctx.interaction.reply({ embeds: [embed] });

			item.amount -= 1;
			await item.save();
			if (item.amount === 0) await item.remove();
		} else if (subcommand === 'give') {
			const member = ctx.interaction.options.getMember('member');
			const memberEntity = await Member.findOne({ relations: ['user'], where: { user: { id: member.user.id }, guild: { id: ctx.guildEntity.id } } });
			const userItem = await Item.findOne({ where: { id: listing.id, owner: { userId: memberEntity.userId, guildId: memberEntity.guildId } } });
			if (userItem && !item.listing.stackable) {
				await ctx.embedify('warn', 'user', 'That user already has that non-stackable item').send(true);
				return;
			}

			const amount = ctx.interaction.options.getInteger('amount') || 1;
			if (amount > item.amount) {
				await ctx.embedify('warn', 'user', `You do not have ${amount} \`${item.listing.name}\`s`).send(true);
				return;
			}

			if (userItem) {
				userItem.amount += amount;
				await userItem.save();
			} else await Item.create({ owner: memberEntity, listing, amount }).save();
			item.amount -= 1;
			await item.save();
			if (item.amount === 0) await item.remove();

			await ctx.embedify('success', 'user', `Gave ${amount} x \`${item.listing.name}\` to ${member.user}`).send();
		}
	};
}
