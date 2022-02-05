import { EmbedFieldData, Message, MessageEmbed } from 'discord.js';
import ms from 'ms'

import * as util from '../../lib';
import { MemberModel, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription("Interact with the server's shop.")
		.setFormat('<view | clear | disable | delete> [...options]')
		.setGroup('SHOP')
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('view')
				.setDescription('View shop items.')
				.addEconomicaSubcommand((subcommand) => 
					subcommand
						.setName('all')
						.setDescription("View all the items in the server's shop")
						.addIntegerOption(
							(options) => options.setName('page').setDescription('The page of the shop to view.').setRequired(false) // default: 1
						)
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('single')
						.setDescription('View info on a single item in the shop.')
						.addStringOption((options) => 
							options
								.setName('name')
								.setDescription('The name of the item to view.')
								.setRequired(true)
						)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('enable')
				.setDescription('Enable a shop item.')
				.setAuthority('MANAGER')
				.addStringOption((option) =>
					option.setName('name').setDescription('Specify the name of the item.').setRequired(true)
				)
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('disable')
				.setDescription('Disable shop items.')
				.setAuthority('MANAGER')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('single')
						.setDescription('Disable a single shop item.')
						.addStringOption((option) =>
							option.setName('name').setDescription('Specify the name of the item.').setRequired(true)
						)
				)
				.addEconomicaSubcommand((subcommand) => subcommand.setName('all').setDescription('Disable all shop items.'))
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('delete')
				.setDescription('Delete shop items.')
				.setAuthority('MANAGER')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('single')
						.setDescription('Delete a single shop item.')
						.addStringOption((option) =>
							option.setName('name').setDescription('Specify the name of the item.').setRequired(true)
						)
				)
				.addEconomicaSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all shop items.'))
		);

	public execute = async (ctx: Context): Promise<Message | void> => {
		const { currency } = ctx.guildDocument;
		const subcommand = ctx.interaction.options.getSubcommand();
		const subcommandGroup = ctx.interaction.options.getSubcommandGroup(false);
		const page = ctx.interaction.options.getInteger('page', false) ?? 1;
		const name = ctx.interaction.options.getString('name', false);

		const embeds: MessageEmbed[] = [];
		const maxEntries = 15;
		const shopEntries: EmbedFieldData[] = [];
		const pageCount = Math.ceil(shopEntries.length / maxEntries) || 1;
		const shop = await ShopModel.find({ guildId: ctx.interaction.guildId }).sort({ price: -1 });

		if (subcommandGroup === 'view') {
			if (subcommand === 'all') {
				shop.forEach((item) => {
					if (item.active) {
						const field: EmbedFieldData = {
							name: `${currency}${item.price ?? 'Free'} • ${item.name}`,
							value: util.cut(item.description ?? 'An interesting item', 150) + `\nIn-stock: \`${item.stock ?? '∞'}\``,
							inline: item.description?.length <= 75,
						};
	
						shopEntries.push(field);
					}
				});
	
				let k = 0;
				for (let i = 0; i < pageCount; i++) {
					const embed = ctx.embedify('info', 'guild', `There are \`${shopEntries.length}\` items in the shop.`);
					for (let j = 0; j < maxEntries; j++, k++) {
						if (shopEntries[k]) {
							//todo: replace with addField(EmbedFieldData) (not deprecated)
							embed.addFields([shopEntries[k]]);
						}
					}
	
					embeds.push(embed);
				}
	
				await util.paginate(ctx.interaction, embeds, page - 1);
			} else if (subcommand === 'single') {
				const item = shop.find(item => item.name.toLowerCase() === ctx.interaction.options.getString('name').toLowerCase());

				if (!item)
					return ctx.embedify('error', 'user', `No item with name \`${ctx.interaction.options.getString('name')}\` found (case-insensitive).`, true)

				const embed = ctx.embedify('info', 'user', `${item.description}`)
					.setTitle(item.name)
					// Global fields
					.setFields([
						{ name: 'Type', value: `\`${item.type}\``, inline: false },
						{ name: 'Active?', value: `\`${item.active}\``, inline: true },
						{ name: 'Price', value: `${ctx.guildDocument.currency}${item.price || 'Free'}`, inline: true },
						{ name: 'Required Treasury', value: `${ctx.guildDocument.currency}${item.treasuryRequired}+`, inline: true },
						{ name: 'Shop Duration Left', value: `${item.duration != Number.POSITIVE_INFINITY && item.active? ms((item.createdAt.getTime() + item.duration) - Date.now()) : 'Infinite'}`, inline: true },
						{ name: 'Stock Left', value: `${item.stock}`, inline: true },
						{ name: 'Roles Given', value: item.rolesGiven.length? `<@&${item.rolesGiven.join('>, <@&')}>` : 'None', inline: true },
						{ name: 'Roles Removed', value: item.rolesRemoved.length? `<@&${item.rolesRemoved.join('>, <@&')}>` : 'None', inline: true },
						{ name: 'Required Roles', value: item.requiredRoles.length? `@&${item.requiredRoles.join('>, <@&')}>` : 'None', inline: true },
						{ name: 'Required Inventory Items', value: item.requiredItems.length? `\`${item.requiredItems.map(itemId => itemId = shop.find(item => item._id == itemId).name).join('`, `')}\`` : 'None', inline: true }
					]);

				if (item.type === 'GENERATOR')
					embed.addFields([
						{ name: 'Generator', value: `Generates ${ctx.guildDocument.currency}${item.generatorAmount} every ${ms(item.generatorPeriod)}`}
					])
				
				return await ctx.interaction.reply({ embeds: [embed] });
			}
		} else if (subcommand === 'enable') {
			const shopItem = await ShopModel.findOneAndUpdate({ name }, { active: true });
			if (!shopItem) {
				return await ctx.embedify('error', 'user', 'Could not find an item with that name.', true);
			} else {
				return await ctx.embedify('success', 'user', 'Item enabled.', false);
			}
		} else if (subcommandGroup === 'disable') {
			if (subcommand === 'single') {
				const shopItem = await ShopModel.findOneAndUpdate(
					{ guildId: ctx.interaction.guildId, name },
					{ active: false }
				);
				if (!shopItem) {
					return await ctx.embedify('error', 'user', 'Could not find a shop item with that name.', true);
				} else {
					return await ctx.embedify('success', 'user', 'Item disabled.', false);
				}
			} else if (subcommand === 'all') {
				const shopItems = await ShopModel.updateMany({ guildId: ctx.interaction.guildId }, { active: false });
				return await ctx.embedify('success', 'user', `Enabled ${shopItems.nModified} shop items.`, false);
			}
		} else if (subcommandGroup === 'delete') {
			if (subcommand === 'single') {
				const shopItem = await ShopModel.deleteOne({ guildId: ctx.interaction.guildId, name });
				if (!shopItem) {
					return await ctx.embedify('error', 'user', 'Could not find a shop item with that name.', true);
				} else {
					const updates = await MemberModel.updateMany(
						{ guildId: ctx.interaction.guildId },
						{ $pull: { inventory: { name } } }
					);
					return await ctx.embedify(
						'success',
						'user',
						`Item deleted. ${updates.nModified} removed from inventories.`,
						false
					);
				}
			} else if (subcommand === 'all') {
				const shopItems = await ShopModel.deleteMany({ guildId: ctx.interaction.guildId });
				const updates = await MemberModel.updateMany(
					{ guildId: ctx.interaction.guildId },
					{ $pull: { inventory: { name } } }
				);
				return await ctx.embedify(
					'success',
					'user',
					`${shopItems.deletedCount} items deleted. ${updates.nModified} removed from inventories.`,
					false
				);
			}
		}
	};
}
