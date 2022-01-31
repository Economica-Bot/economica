import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('income')
		.setDescription('Configure income commands and their settings.')
		.setGroup('INCOME')
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
				.addIntegerOption((option) => option.setName('chance').setDescription('Specify a chance.').setMinValue(1))
				.addIntegerOption((option) =>
					option.setName('minfine').setDescription('Specify the minimum fine.').setMinValue(0)
				)
				.addIntegerOption((option) =>
					option.setName('maxfine').setDescription('Specify the maximum fine.').setMinValue(1)
				)
		);

	execute = async (ctx: Context): Promise<Message> => {
		const subcommand = ctx.interaction.options.getSubcommand();

		if (subcommand === 'view') {
			const description: string[] = [];
			for (const [k, v] of Object.entries(ctx.guildDocument.income)) {
				const desc = [];
				for (const [k1, v1] of Object.entries(v)) {
					desc.push(`\`${k1}: ${v1}\``);
				}
				description.push(`**${k}**\n${desc.join('\n')}`);
			}

			return await ctx.embedify('info', 'guild', description.join('\n'), false);
		} else if (subcommand === 'edit') {
			const min = ctx.interaction.options.getInteger('minimum', false);
			const max = ctx.interaction.options.getInteger('maximum', false);
			const chance = ctx.interaction.options.getInteger('chance', false);
			const minfine = ctx.interaction.options.getInteger('minfine', false);
			const maxfine = ctx.interaction.options.getInteger('maxfine', false);
			const command = ctx.interaction.options.getString('command');
			const inter = ctx.client.commands.get(command);
			if (!inter) {
				return await ctx.embedify('error', 'user', 'Could not find that command.', true);
			}

			const data = inter.data as EconomicaSlashCommandBuilder;
			if (data.group !== 'INCOME') {
				return await ctx.embedify('error', 'user', `That is not an \`INCOME\` command.`, true);
			}

			const income = ctx.guildDocument.income;
			let c: keyof typeof income;
			for (c in income) {
				if (c === command) {
					const obj = income[c];
					if (min && min !== 0 && 'min' in obj) obj.min = min;
					if (max && max !== 0 && 'max' in obj) obj.max = max;
					if (chance && chance !== 0 && 'chance' in obj) obj.chance = chance;
					if (minfine && minfine !== 0 && 'minfine' in obj) obj.minfine = minfine;
					if (maxfine && maxfine !== 0 && 'maxfine' in obj) obj.maxfine = maxfine;
				}
			}

			await ctx.guildDocument.updateOne({ income });
			return await ctx.embedify('success', 'user', `Updated \`${command}\`.`, false);
		}
	};
}
