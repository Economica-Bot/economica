import { MessageEmbed } from 'discord.js';

import { paginate } from '../../lib/index.js';
import { Listing, MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View an inventory')
		.setModule('ECONOMY')
		.setFormat('inventory [user]')
		.setExamples(['inventory', 'inventory @user'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user'));

	public execute = async (ctx: Context): Promise<void> => {
		const { interaction } = ctx;
		const user = interaction.options.getUser('user') || interaction.user;
		const memberDocument = await MemberModel.findOne({
			guild: ctx.guildDocument,
			userId: user.id,
		});

		const embeds: MessageEmbed[] = [];
		const maxEntries = 30;
		const entries: string[] = [];

		let total = 0;
		memberDocument.inventory.forEach(async (invItem) => {
			const { listing }: { listing: Listing } = await invItem.populate('listing').execPopulate();
			entries.push(`\`${listing.name}\` (${invItem.amount})`);
			total += invItem.amount;
		});

		const pageCount = Math.ceil(entries.length / maxEntries) || 1;

		let k = 0;
		for (let i = 0; i < pageCount; i += 1) {
			const columns: string[] = ['', '', ''];
			for (let j = 0; j < maxEntries && entries[k]; j += 1, k += 1) {
				if (entries[k]) columns[k % 3] += `${entries[k]}\n`;
			}

			embeds.push(
				ctx.embedify('info', 'user', `${user}'s inventory`)
					.setDescription(`${user.username} has \`${entries.length}\` distinct items and a total volume of \`${total}\` items.`)
					.setFields([
						{ name: '\u200b', value: columns[0].length ? columns[0] : '\u200b', inline: true },
						{ name: '\u200b', value: columns[1].length ? columns[1] : '\u200b', inline: true },
						{ name: '\u200b', value: columns[2].length ? columns[2] : '\u200b', inline: true },
					]),
			);
		}

		return paginate(ctx.interaction, embeds, 0);
	};
}
