import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('interval')
		.setDescription('View and configure interval commands.')
		.setModule('INTERVAL')
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View interval command configurations.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit interval command configs.')
				.setAuthority('MANAGER')
				.addStringOption((option) => option.setName('command').setDescription('Specify the command.').setRequired(true))
				.addIntegerOption((option) =>
					option.setName('funds').setDescription('Specify the funds.').setMinValue(1).setRequired(true)
				)
		);

	execute = async (ctx: Context): Promise<Message | void> => {
		const intervals = ctx.guildDocument.intervals;
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const embed = ctx.embedify('info', 'guild', 'Interval command information');
			for (const [k, v] of Object.entries(intervals)) {
				const description = [];
				for (const [k1, v1] of Object.entries(v)) {
					description.push(`\`${k1}: ${v1}\``);
				}

				embed.addField(k, `${description.join('\n')}`, true);
			}

			return await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'edit') {
			const funds = ctx.interaction.options.getInteger('funds');
			const command = ctx.interaction.options.getString('command');
			const inter = ctx.client.commands.get(command);

			if (!inter) {
				return await ctx.embedify('error', 'user', 'Could not find that command.', true);
			} else if (inter.data.name in Object.keys(intervals)) {
				return await ctx.embedify('error', 'user', `That is not an \`INCOME\` command.`, true);
			}

			let k: keyof typeof intervals;
			for (k in intervals) if (k === command) intervals[k].amount = funds;
			await ctx.guildDocument.updateOne({ intervals });
			return await ctx.embedify('success', 'user', `Updated \`${command}\`.`, false);
		}
	};
}
