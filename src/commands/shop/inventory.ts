import { APIEmbedField, Util } from 'discord.js';

import { Item } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View purchased items.')
		.setModule('SHOP')
		.setFormat('inventory')
		.setExamples(['inventory'])
		.addUserOption((option) => option
			.setName('user')
			.setDescription('Specify a user'));

	public execute = async (ctx: Context) => {
		const member = ctx.interaction.options.getMember('user') ?? ctx.interaction.member;
		const items = await Item.find({ relations: ['listing'], where: { owner: { userId: member.id, guildId: member.guild.id } } });
		const inventoryEmbed = ctx
			.embedify('info', 'user', 'If an item is of type `USABLE`, you may use it at any time with the `/item use` command. You may sell items on the market with `/market sell <id>`, or give them away with `/item give <id>`.')
			.setAuthor({ name: `Inventory of ${member.user.tag}`, iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.STACK).id)?.url })
			.setFields(items.map((item) => ({ name: `${item.listing.name} (*${item.listing.type}*) - \`${item.amount}\``, value: `>>> ${item.listing.description}\n**Id:** \`${item.id}\`` } as APIEmbedField)));
		await ctx.interaction.reply({ embeds: [inventoryEmbed] });
	};
}
