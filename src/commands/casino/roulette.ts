import { ActionRowBuilder, ComponentType, SelectMenuBuilder, SelectMenuOptionBuilder, Util } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis, RouletteBets } from '../../typings/index.js';

const row = new ActionRowBuilder<SelectMenuBuilder>()
	.setComponents(
		new SelectMenuBuilder()
			.setPlaceholder('None Selected')
			.setCustomId('roulette_select')
			.setOptions(
				...Object.keys(RouletteBets)
					.map((bet: keyof typeof RouletteBets) => new SelectMenuOptionBuilder()
						.setValue(bet)
						.setLabel(RouletteBets[bet].formatted)
						.setDescription(RouletteBets[bet].description)),
			),
	);

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('roulette')
		.setDescription('Play roulette')
		.setModule('CASINO')
		.setFormat('roulette')
		.setExamples(['roulette'])
		.setAuthority('USER')
		.setDefaultPermission(false);

	public execute = async (ctx: Context): Promise<void> => {
		const img = 'https://c.tenor.com/92nSRpL7ukkAAAAM/casino-gamble.gif';
		const description = `**Welcome, ${ctx.interaction.user}, to the Roulette Table!**\n\n🤔 **How to play?**\nPlaying roulette is more simple then you think!\nSimply follow the prompts that are given to you and gamble your way to unimaginable wealth!\n\n⏫ **Start a Game!**\nSelect an option below to begin a game of Roulette. May the force be with you.`;
		const embed = ctx
			.embedify('info', 'user', description)
			.setAuthor({ name: 'Play Roulette!', iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.ROULETTE).id)?.url })
			.setThumbnail(img);
		const msg = await ctx.interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
		const interaction = await msg.awaitMessageComponent({ filter: (i) => i.user.id === ctx.interaction.user.id, componentType: ComponentType.SelectMenu });
		console.log(interaction);
	};
}
