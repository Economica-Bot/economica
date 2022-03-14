import { MessageEmbed } from 'discord.js';

import { Listing } from '../../entities/index.js';
import { paginate } from '../../lib/paginate.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('')
		.setDescription('Create and purchase listings')
		.setModule('SHOP')
		.setFormat('shop <view | buy> [item]')
		.setExamples([
			'shop view',
			'shop view Plane',
			'shop buy Plane',
		])
		.addSubcommand((subcommand) => subcommand
			.setName('View')
			.setDescription('View shop listings')
			.addStringOption((option) => option
				.setName('listing').setDescription('Specify a listing')))
		.addSubcommand((subcommand) => subcommand
			.setName('buy')
			.setDescription('Buy an item')
			.addStringOption((option) => option
				.setName('listing').setDescription('Specify a listing').setRequired(true)));

	public execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const query = ctx.interaction.options.getString('listing');
		const listings = await Listing.find({ guild: ctx.guildEntity });
		const listing = listings.find((l) => l.name === query);
		if (query && !listing) {
			await ctx.embedify('error', 'user', `Could not find listing named \`${query}\``, true);
			return;
		}

		if (subcommand === 'view') {
			if (listing) {
				const description = listing.toString();
				await ctx.embedify('info', 'user', description, false);
				return;
			}

			const maxEntries = 10;
			const pageCount = listings.length / maxEntries || 1;
			const embeds: MessageEmbed[] = [];
			let k = 0;
			for (let i = 0; i < pageCount; i++) {
				const embed = ctx.embedify('info', 'guild', `Welcome to ${ctx.client.user}'s shop!`);
				for (let j = 0; j < maxEntries; j++, k++) {
					if (listings[k]) embed.addField(listings[k].name, `${ctx.guildEntity.currency}${listing.price}\n*${listing.description}*`, true);
				}

				embeds.push(embed);
			}

			await paginate(ctx.interaction, embeds);
		}
	};
}
