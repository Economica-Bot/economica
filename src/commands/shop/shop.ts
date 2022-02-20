import { EmbedFieldData, Message, MessageEmbed } from 'discord.js';
import ms from 'ms';

import * as util from '../../lib';
import { MemberModel, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription("Interact with the server's shop.")
		.setFormat('<view | clear | disable | delete> [...options]')
		.setModule('SHOP')
		.addEconomicaSubcommandGroup((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View shop items.')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('all')
						.setDescription("View all the items in the server's shop")
						.addIntegerOption(
							(options) => options.setName('page').setDescription('The page of the shop to view.').setRequired(false) // default: 1
						)
						.addStringOption((options) =>
							options
								.setName('show_hidden')
								.setDescription('Include disabled items as well')
								.addChoice('Show Disabled Items', 'all')
						)
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('single')
						.setDescription('View info on a single item in the shop.')
						.addStringOption((options) =>
							options.setName('name').setDescription('The name of the item to view.').setRequired(true)
						)
				)
		)
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
		const shop = await ShopModel.find({ guild: ctx.guildDocument }).sort({ price: -1 });

		if (subcommandGroup === 'view') {
			if (subcommand === 'all') {
				shop.forEach((item) => {
					if (item.active || ctx.interaction.options.getString('show_hidden')) {
						const field: EmbedFieldData = {
							name: `${currency}${item.price ?? 'Free'} • ${item.name} ${item.active? '' : '<:ITEM_DISABLED:944737714274717746>'}`,
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
				const item = shop.find(
					(item) => item.name.toLowerCase() === ctx.interaction.options.getString('name').toLowerCase()
				);

				if (!item)
					return ctx.embedify(
						'error',
						'user',
						`No item with name \`${ctx.interaction.options.getString('name')}\` found (case-insensitive).`,
						true
					);

				return await ctx.interaction.reply({ embeds: [await util.itemInfo(ctx, item)] });
			}
		}
	};
}
