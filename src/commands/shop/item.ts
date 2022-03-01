import { CommandInteraction, GuildMemberRoleManager, MessageEmbed } from "discord.js";
import { Types } from "mongoose";
import ms from "ms";
import { asyncSome, cut, getEconInfo, itemInfo, itemRegExp, transaction } from "../../lib";
import { confirmModal } from "../../lib/confirmModal";
import { MemberModel, Shop, ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('item')
		.setDescription('Interact with shop items')
		.setModule('SHOP')
		.setDefaultPermission(true)
		// buy
		.addEconomicaSubcommand(s => s
			.setName('buy')
			.setDescription('Buy an item.')
			.addStringOption((option) => option.setName('name').setDescription('Specify the name.').setRequired(true))
		)
		// sell
		.addEconomicaSubcommand(s => s
			.setName('sell')
			.setDescription('Sell an item.')
			.addStringOption((option) => option.setName('item').setDescription('Specify an item.').setRequired(true))
		)
		// use
		.addEconomicaSubcommand(s => s
			.setName('use')
			.setDescription('Use a usable inventory item.')
			.addStringOption((options) =>
				options
					.setName('name')
					.setDescription('The name of the item to use.')
					.setRequired(true)
			)
		)
		// give
		.addEconomicaSubcommand(s => s
			.setName('give')
			.setDescription('Give a user a new instance of an existing item.')
			.setAuthority('MANAGER')
			.addUserOption((options) =>
				options
					.setName('user')
					.setDescription('The user to give the item(s) to.')
					.setRequired(true)
			)
			.addStringOption((options) =>
				options
					.setName('name')
					.setDescription('The name of the item to give.')
					.setRequired(true)
			)
			.addIntegerOption((options) =>
				options
					.setName('amount')
					.setDescription('The amount of this item to give to the user.')
			)
		)
	execute = async (ctx: Context) => {
		const itemCommand = ctx.interaction.options.getSubcommandGroup(false) ?? ctx.interaction.options.getSubcommand();

		if (itemCommand == 'buy') {
			const query = ctx.interaction.options.getString('name');
			const shop = await ShopModel.findOne({ guild: ctx.guildDocument, name: itemRegExp(query) });

			if (!shop.active)
				return await ctx.embedify('error', 'user', `The item \`${shop.name}\` is not active. Contact your Economy Manager for more info.`, true)

			if (!shop)
				return await ctx.embedify('error', 'user', `Could not find an item with name \`${query}\` (case-insensitive)`, true)

			const hasItem = await asyncSome(ctx.memberDocument.inventory, (async (invItem) => {
				ctx.memberDocument = await ctx.memberDocument.populate({
					path: `inventory.shop`,
					model: 'Shop'
				}).execPopulate()

				const inventoryItem = ctx.memberDocument.inventory.find(i => {
					return `${i.shop._id}` == `${shop._id}`
				})

				if (inventoryItem) {
					return true
				}
				else return false
			}));

			const { currency } = ctx.guildDocument;
			const { wallet, treasury } = await getEconInfo(ctx.memberDocument);
			const missingRoles = new Array<String>();
			const missingItems = new Array<String>();

			shop.requiredRoles?.forEach(async (roleId) => {
				if (!(ctx.interaction.member.roles as GuildMemberRoleManager).cache.has(roleId)) {
					missingRoles.push(roleId);
				}
			});

			shop
				.populate('requiredItems')
				.execPopulate()
				.then((shop) => {
					shop.requiredItems.forEach(async (shop: Shop) => {
						if (!ctx.memberDocument.inventory.some((entry) => entry.shop._id === shop._id)) {
							missingItems.push(shop.name);
						}
					});
				});

			if (!shop) {
				return await ctx.embedify('error', 'user', 'Could not find an item with that name.', true);
			} else if (shop.price > wallet) {
				return await ctx.embedify('warn', 'user', 'You cannot afford this item.', true);
			} else if (shop.treasuryRequired > treasury) {
				// prettier-ignore
				return await ctx.embedify('warn', 'user', `You need ${currency}${shop.treasuryRequired.toLocaleString()} in your treasury.`, true);
			} else if (missingItems.length) {
				return await ctx.embedify('warn', 'user', `You are missing \`${missingItems.join('`, `')}\`.`, true);
			} else if (missingRoles.length) {
				return await ctx.embedify('warn', 'user', `You are missing <@&${missingRoles.join('>, <@&')}>.`, true);
			} else if (hasItem && !shop.stackable) {
				return await ctx.embedify('warn', 'user', 'This item is not stackable.', true);
			}

			await ctx.embedify(
				'success',
				'user',
				`Purchased \`${shop.name}\` for ${currency}${shop.price.toLocaleString()}`,
				false
			);

			if (shop.usability == 'Instant') {
				shop.rolesRemoved.forEach(async (roleId) => {
					(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Purchased ${shop.name}`);
				});

				shop.rolesGiven.forEach((roleId) => {
					(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${shop.name}`);
				});
			}

			await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'BUY', -shop.price, 0);

			if (hasItem) {
				// prettier-ignore
				ctx.memberDocument.inventory.find((v) => {
					if (`${v.shop._id}` === `${shop._id}`)
						return v
				}).amount += 1;
				ctx.memberDocument.markModified('inventory');
			} else {
				ctx.memberDocument.inventory.push({ shop, amount: 1 });
			}

			await ctx.memberDocument.save();
			shop.stock -= 1;
			shop.save();
		}
		else if (itemCommand == 'sell') {
			const query = ctx.interaction.options.getString('item');
			const shop = await ShopModel.findOne({ name: new RegExp(`^${query}`, 'i') });
			const hasItem = await asyncSome(ctx.memberDocument.inventory, (async (invItem) => {
				ctx.memberDocument = await ctx.memberDocument.populate({
					path: `inventory.shop`,
					model: 'Shop'
				}).execPopulate()

				const inventoryItem = ctx.memberDocument.inventory.find(i => {
					return `${i.shop._id}` == `${shop._id}`
				})

				if (inventoryItem) {
					return true
				}
				else return false
			}));

			const { currency } = ctx.guildDocument;

			if (!shop) {
				return await ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` found (case-insensitive).`, true);
			} else if (!hasItem) {
				return await ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` found in inventory (case-insensitive).`, true);
			}

			await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'SELL', (shop.price * ctx.guildDocument.sellRefund), 0);

			ctx.memberDocument.inventory.map((entry) => {
				if (entry.amount === 1) {
					return ctx.memberDocument.inventory.pull(entry);
				} else {
					entry.amount -= 1;
					return entry;
				}
			});

			ctx.memberDocument.save();
			shop.stock += 1;
			shop.save();

			return await ctx.embedify(
				'success',
				'user',
				`Sold \`${shop.name}\` for ${currency}${(shop.price * ctx.guildDocument.sellRefund).toLocaleString()}`,
				false
			)
		}
		else if (itemCommand == 'use') {
			const { interaction, memberDocument } = ctx;
			const query = interaction.options.getString('name');

			const item = await ShopModel.findOne({
				guild: ctx.guildDocument,
				name: itemRegExp(query)
			})

			if (!item)
				return await ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` exists.`, true)

			const { inventory } = memberDocument;

			const inventoryItem = inventory.find(invItem => `${invItem.shop}` == `${item._id}`)

			if (!inventoryItem)
				return await ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` (case-insensitive) found in inventory.`, true)

			if (item.usability == 'Usable') {
				const embed = ctx.embedify('success', 'user', `Used \`${item.name}\` x1`)

				if (item.rolesGiven.length) {
					item.rolesGiven.forEach((roleId) => {
						(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${item.name}`);
					});

					embed.addField('Roles Given', `<@&${item.rolesGiven.join('>, <@&')}>`)
				}
				if (item.rolesRemoved.length) {
					item.rolesRemoved.forEach((roleId) => {
						(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Purchased ${item.name}`);
					})

					embed.addField('Roles Removed', `<@&${item.rolesRemoved.join('>, <@&')}>`)
				}

				// If item has amount, decrease; if not, delete.
				ctx.memberDocument.inventory.map(item => {
					if (item == inventoryItem)
						item.amount > 1 ? item.amount -= 1 : item.remove()
				})

				ctx.memberDocument.markModified('inventory')
				await ctx.memberDocument.save()

				return await interaction.reply({
					embeds: [embed]
				})
			} else if (item.usability == 'Unusable')
				return await ctx.embedify('error', 'user', 'This item is unusable.', true)
		}
		else if (itemCommand == 'give') {
			const { interaction } = ctx;

			const user = interaction.options.getUser('user');
			const item = await ShopModel.findOne({ guild: ctx.guildDocument, name: itemRegExp(interaction.options.getString('name')) });
			const amount = interaction.options.getInteger('amount') || 1;

			if (!item)
				return await ctx.embedify('error', 'user', `No item with name \`${item.name}\` found (case-insensitive)`, true);

			if (amount <= 0)
				return await ctx.embedify('error', 'user', '`amount` must be a positive integer greater than 0.', true);
			await ctx.embedify('success', 'user', `Gave ${amount} x \`${item.name}\` to ${user.username}`, false);

			const invItem = ctx.memberDocument.inventory.find(i => `${i.shop?._id}` == `${item._id}`);

			if (invItem) {
				invItem.amount += amount;
				ctx.memberDocument.markModified('inventory');
			} else {
				ctx.memberDocument.inventory.push({ shop: item, amount });
				ctx.memberDocument.markModified('inventory');
			}

			await ctx.memberDocument.save();
			return;
		}
		else
			throw new Error(`Unknown itemCommand ${itemCommand}`)
	}
}