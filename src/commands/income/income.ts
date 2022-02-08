import { Message } from 'discord.js';
import ms from 'ms';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('income')
		.setDescription('Configure income commands and their settings.')
		.setModule('INCOME')
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View income command configurations.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit income command configs.')
				.setAuthority('MANAGER')
				.addStringOption((option) => option.setName('command').setDescription('Specify the command.').setRequired(true))
				.addIntegerOption((option) =>
					option.setName('minimum').setDescription('Specify the minimum value.').setMinValue(0)
				)
				.addIntegerOption((option) =>
					option.setName('maximum').setDescription('Specify the maximum value.').setMinValue(1)
				)
				.addIntegerOption((option) =>
					option.setName('chance').setDescription('Specify a chance.').setMinValue(1).setMaxValue(100)
				)
				.addIntegerOption((option) =>
					option.setName('minfine').setDescription('Specify the minimum fine.').setMinValue(0)
				)
				.addIntegerOption((option) =>
					option.setName('maxfine').setDescription('Specify the maximum fine.').setMinValue(1).setMaxValue(100)
				)
				.addStringOption((option) => option.setName('cooldown').setDescription('Specify the cooldown.'))
		);

	public execute = async (ctx: Context): Promise<Message | void> => {
		const incomes = ctx.guildDocument.incomes;
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const embed = ctx.embedify('info', 'guild', 'Income command information');
			for (const [k, v] of Object.entries(incomes)) {
				const description = [];
				for (const [k1, v1] of Object.entries(v)) {
					description.push(`\`${k1}: ${v1}\``);
				}

				embed.addField(k, `${description.join('\n')}`, true);
			}

			return await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'edit') {
			const min = ctx.interaction.options.getInteger('minimum', false);
			const max = ctx.interaction.options.getInteger('maximum', false);
			const chance = ctx.interaction.options.getInteger('chance', false);
			const minfine = ctx.interaction.options.getInteger('minfine', false);
			const maxfine = ctx.interaction.options.getInteger('maxfine', false);
			const cooldown = ctx.interaction.options.getString('cooldown', false);
			const command = ctx.interaction.options.getString('command');
			const inter = ctx.client.commands.get(command);

			if (!inter) {
				return await ctx.embedify('error', 'user', 'Could not find that command.', true);
			} else if (inter.data.name in Object.keys(incomes)) {
				return await ctx.embedify('error', 'user', `That is not an \`INCOME\` command.`, true);
			}

			let k: keyof typeof incomes;
			for (k in incomes) {
				if (k === command) {
					if (min && 'min' in incomes[k]) incomes[k].min = min;
					if (max && 'max' in incomes[k]) incomes[k].max = max;
					if (chance && 'chance' in incomes[k]) incomes[k].chance = chance;
					if (minfine && 'minfine' in incomes[k]) incomes[k].minfine = minfine;
					if (maxfine && 'maxfine' in incomes[k]) incomes[k].maxfine = maxfine;
					if (cooldown && 'cooldown' in incomes[k] && ms(cooldown)) incomes[k].cooldown = ms(cooldown);
				}
			}

			await ctx.guildDocument.updateOne({ incomes });
			return await ctx.embedify('success', 'user', `Updated \`${command}\`.`, false);
		}
	};
}
