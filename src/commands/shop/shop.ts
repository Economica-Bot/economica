import { Listing } from '../../entities';
import { displayListing, displayListings } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription('Interact with the shop')
		.setModule('SHOP')
		.setFormat('shop')
		.setExamples(['shop'])
		.addStringOption((option) => option
			.setName('query')
			.setDescription('Search for a specific item'));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('query', false);
		if (!query) {
			const listings = await Listing.findBy({ guild: { id: ctx.guildEntity.id } });
			await displayListings(ctx, listings);
			return;
		}

		const listing = await Listing.findOne({ where: { guild: { id: ctx.guildEntity.id }, name: query } });
		if (!listing) {
			await ctx.embedify('error', 'user', `Could not find a listing that matched the query \`${query}\`.`).send();
			return;
		}

		await displayListing(ctx, listing);
	};
}
