import { ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from '@discordjs/builders';
import { Util } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('store')
		.setDescription('Test command')
		.setModule('SHOP')
		.setFormat('store')
		.setExamples(['store']);

	public execute = async (ctx: Context) => {
		const marketEmbed = ctx
			.embedify('info', 'user', '**Choose the shop you want to view.**\nAlternatively, you can visit our [dashboard shop!](http://example.com)')
			.setThumbnail(ctx.client.emojis.cache.get(Util.parseEmoji(Emojis.BACKPACK).id).url)
			.addFields([
				{ name: '‎‎‎Gems', value: `${Emojis.GEM} \`483\` [ɢᴇᴍ]`, inline: true },
				{ name: '‎‎‎Keys', value: `${Emojis.KEY} \`${ctx.userEntity.keys}\` [ᴋᴇʏ]`, inline: true },
				{ name: '‎‎‎Wallet', value: `${Emojis.CREDIT} \`${ctx.memberEntity.wallet}\` ${ctx.guildEntity.currency}\n‎`, inline: true },
				{ name: `<:1:974537782418628729> ${Emojis.GLOBAL} Global Shop`, value: 'Browse through Economica\'s global shop.' },
				{ name: `<:2:974537746716721163> ${Emojis.CHEST} Server Shop`, value: `Browse through **\`${ctx.interaction.guild.name}\`'s** server shop.` },
				{ name: `<:3:974537758972465163> ${Emojis.BOX} Second-Hand Shop`, value: 'Browse through the second hand shop.' },
			]);

		const marketRow = new ActionRowBuilder<SelectMenuBuilder>()
			.setComponents([
				new SelectMenuBuilder()
					.setCustomId('shop')
					.setOptions([
						new SelectMenuOptionBuilder()
							.setEmoji({ id: '974537782418628729' })
							.setLabel('Global Shop')
							.setValue('global_shop'),
						new SelectMenuOptionBuilder()
							.setEmoji({ id: '974537746716721163' })
							.setLabel('Server Shop')
							.setValue('server_shop'),
						new SelectMenuOptionBuilder()
							.setEmoji({ id: '974537758972465163' })
							.setLabel('Second Hand Shop')
							.setValue('second_hand_shop'),
					]),
			]);

		await ctx.interaction.reply({ embeds: [marketEmbed], components: [marketRow] });
	};
}
