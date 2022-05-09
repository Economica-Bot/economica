import { APIEmbedField, Util } from 'discord.js';
import { Item } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';
import { Emojis, ListingDescriptions } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View purchased items.')
		.setModule('SHOP')
		.setFormat('inventory')
		.setExamples(['inventory']);

	public execute = async (ctx: Context) => {
		const items = await Item.find({ relations: ['listing'], where: { owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId } } });

		const classicItems = items.filter((item) => item.listing.type === 'CLASSIC');
		const usableItems = items.filter((item) => item.listing.type === 'USABLE');
		const generators = items.filter((item) => item.listing.type === 'GENERATOR');

		const inventoryEmbed = ctx
			.embedify('info', 'user', 'If an item is of type `USABLE`, you may use it at any time with the `/use` command.')
			.setAuthor({ name: 'Inventory', iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.INFO).id)?.url })
			.setFields([
				{ name: 'Classic Items', value: ListingDescriptions.CLASSIC, inline: true },
				{ name: 'Usable Items', value: ListingDescriptions.USABLE, inline: true },
				{ name: 'Generator Items', value: ListingDescriptions.GENERATOR, inline: true },
				{ name: `Quantity: ${classicItems.length}`, value: classicItems.length ? classicItems.map((item) => item.listing.name).join(', ') : 'None', inline: true },
				{ name: `Quantity: ${usableItems.length}`, value: usableItems.length ? usableItems.map((item) => item.listing.name).join(', ') : 'None', inline: true },
				{ name: `Quantity: ${generators.length}`, value: generators.length ? generators.map((item) => item.listing.name).join(', ') : 'None', inline: true },
			]);

		await ctx.interaction.reply({ embeds: [inventoryEmbed] });
	};
}
