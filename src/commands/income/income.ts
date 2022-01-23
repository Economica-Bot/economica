import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import * as config from '../../../config.json';
import { Interaction, MessageEmbed } from 'discord.js';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('income')
		.setDescription('View income commands and their stats.')
		.setGroup('income');

	execute = async (ctx: Context) => {
		const description: string[] = [];
		for (const [k, v] of Object.entries(config.commands)) {
			const desc = [];
			for (const [k1, v1] of Object.entries(v)) {
				desc.push(`\`${k1}: ${v1}\``);
			}
			description.push(`**${k}**\n${desc.join('\n')}`);
		}

		const embed = new MessageEmbed()
			.setColor('GOLD')
			.setAuthor({
				name: `${ctx.interaction.guild.name} Income Commands`,
				iconURL: ctx.interaction.guild.iconURL(),
			})
			.setDescription(description.join('\n'));

		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
