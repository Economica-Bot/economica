import { EmbedFieldData, MessageEmbed } from 'discord.js';

import * as util from '../../lib/index.js';
import { ListingModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription('Interact with the shop')
		.setFormat('shop <view | clear | disable | delete> [...options]')
		.setExamples(['shop view all', 'shop view single Bike', 'shop clear'])
		.setModule('SHOP')
		.addSubcommandGroup((subcommand) => subcommand
			.setName('view')
			.setDescription('View shop item listings')
			.addSubcommand((subcommand) => subcommand
				.setName('all')
				.setDescription('View all shop item listings')
				.addIntegerOption((option) => option.setName('page').setDescription('Specify the page').setMinValue(1).setRequired(false)))
			.addSubcommand((subcommand) => subcommand
				.setName('single')
				.setDescription('View a single shop item listing')
				.addStringOption((options) => options.setName('listing').setDescription('Specify the listing').setRequired(true))));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const subcommandGroup = ctx.interaction.options.getSubcommandGroup(false);
		const page = ctx.interaction.options.getInteger('page', false) ?? 1;
		const listing = ctx.interaction.options.getString('listing', false);

		const embeds: MessageEmbed[] = [];
		const maxEntries = 15;
		const shopEntries: EmbedFieldData[] = [];
		const pageCount = Math.ceil(shopEntries.length / maxEntries) || 1;
		const listings = await ListingModel.find({ guild: ctx.guildDocument }).sort({ price: -1 });

		if (subcommandGroup === 'view') {
			if (subcommand === 'all') {
				listings.forEach((item) => {
					if (item.active || ctx.interaction.options.getString('show_hidden')) {
						const field: EmbedFieldData = {
							name: `${ctx.guildDocument.currency}${item.price ?? 'Free'} • ${item.name} ${
								item.active ? '' : '<:ITEM_DISABLED:944737714274717746>'
							}`,
							value: `${util.cut(item.description ?? 'An interesting item', 150)}\nIn-stock: \`${item.stock ?? '∞'}\``,
							inline: item.description?.length <= 75,
						};

						shopEntries.push(field);
					}
				});

				let k = 0;
				for (let i = 0; i < pageCount; i++) {
					const embed = ctx.embedify('info', 'guild', `There are \`${shopEntries.length}\` items in the listings.`);
					for (let j = 0; j < maxEntries; j++, k++) {
						if (shopEntries[k]) {
							// todo: replace with addField(EmbedFieldData) (not deprecated)
							embed.addFields([shopEntries[k]]);
						}
					}

					embeds.push(embed);
				}

				await util.paginate(ctx.interaction, embeds, page - 1);
			} else if (subcommand === 'single') {
				const item = listings.find((l) => l.name.toLowerCase() === listing);
				if (!item) {
					ctx.embedify('error', 'user', `No listing called \`${listing}\` found (case-insensitive).`, true);
				} else {
					await ctx.interaction.reply('listing');
				}
			}
		}
	};
}
