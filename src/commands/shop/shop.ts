import { EmbedFieldData, MessageEmbed } from 'discord.js';

import { MemberModel, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import * as util from '../../lib/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription("Interact with the server's shop.")
		.setFormat('<view | clear | disable | delete> [...options]')
		.setGroup('shop')
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription("View the items in the server's shop")
				.addIntegerOption(
					(options) => options.setName('page').setDescription('The page of the shop to view.').setRequired(false) // default: 1
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('enable')
				.setDescription('Enable a shop item.')
				.addStringOption((option) =>
					option.setName('name').setDescription('Specify the name of the item.').setRequired(true)
				)
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('disable')
				.setDescription('Disable shop items.')
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

	execute = async (ctx: Context): Promise<any> => {
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

		if (subcommand === 'view') {
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
				const embed = ctx.embedify(
					'info',
					'guild',
					`There are \`${shopEntries.length}\` items in the shop.`,
					false
				) as MessageEmbed;
				for (let j = 0; j < maxEntries; j++, j++) {
					if (shopEntries[k]) {
						//todo: replace with addField(EmbedFieldData) (not deprecated)
						embed.addFields([shopEntries[k]]);
					}
				}

				embeds.push(embed);
			}

			await util.paginate(ctx.interaction, embeds, page - 1);
		} else if (subcommand === 'enable') {
			const shopItem = await ShopModel.findOneAndUpdate({ name }, { active: true });
			if (!shopItem) {
				return await ctx.embedify('error', 'user', 'Could not find an item with that name.');
			}

			return await ctx.embedify('success', 'user', 'Item enabled.');
		} else if (subcommandGroup === 'disable') {
			if (subcommand === 'single') {
				const shopItem = await ShopModel.findOneAndUpdate(
					{ guildId: ctx.interaction.guildId, name },
					{ active: false }
				);
				if (!shopItem) {
					return await ctx.embedify('error', 'user', 'Could not find a shop item with that name.');
				}

				return await ctx.embedify('success', 'user', 'Item disabled.');
			} else if (subcommand === 'all') {
				const shopItems = await ShopModel.updateMany({ guildId: ctx.interaction.guildId }, { active: false });
				return await ctx.embedify('success', 'user', `Enabled ${shopItems.nModified} shop items.`);
			}
		} else if (subcommandGroup === 'delete') {
			if (subcommand === 'single') {
				const shopItem = await ShopModel.deleteOne({ guildId: ctx.interaction.guildId, name });
				if (!shopItem) {
					return await ctx.embedify('error', 'user', 'Could not find a shop item with that name.');
				}

				const updates = await MemberModel.updateMany(
					{ guildId: ctx.interaction.guildId },
					{ $pull: { inventory: { name } } }
				);
				return await ctx.embedify('success', 'user', `Item deleted. ${updates.nModified} removed from inventories.`);
			} else if (subcommand === 'all') {
				const shopItems = await ShopModel.deleteMany({ guildId: ctx.interaction.guildId });
				const updates = await MemberModel.updateMany(
					{ guildId: ctx.interaction.guildId },
					{ $pull: { inventory: { name } } }
				);
				return await ctx.embedify(
					'success',
					'user',
					`${shopItems.deletedCount} items deleted. ${updates.nModified} removed from inventories.`
				);
			}
		}
	};
}
