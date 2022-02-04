import { Message } from 'discord.js';
import ms from 'ms';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
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
		let income = ctx.guildDocument.income;
		const subcommand = ctx.interaction.options.getSubcommand();
		const embed = ctx.embedify('info', 'guild', 'Income command information.');
		if (subcommand === 'view') {
			const description: string[] = [];
			for (const [k, v] of Object.entries(income)) {
				const description = [];
				for (const [k1, v1] of Object.entries(v)) {
					description.push(`\`${k1}: ${v1}\``);
				}

				embed.addField(k, `${description.join('\n')}`);
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
			} else if (inter.data.name in Object.keys(income)) {
				return await ctx.embedify('error', 'user', `That is not an \`INCOME\` command.`, true);
			}

			let k: keyof typeof income;
			for (k in income) {
				if (k === command) {
					if (min && 'min' in income[k]) income[k].min = min;
					if (max && 'max' in income[k]) income[k].max = max;
					if (chance && 'chance' in income[k]) income[k].chance = chance;
					if (minfine && 'minfine' in income[k]) income[k].minfine = minfine;
					if (maxfine && 'maxfine' in income[k]) income[k].maxfine = maxfine;
					if (cooldown && 'cooldown' in income[k] && ms(cooldown)) income[k].cooldown = ms(cooldown);
				}
			}

			await ctx.guildDocument.updateOne({ income });
			return await ctx.embedify('success', 'user', `Updated \`${command}\`.`, false);
		}
	};
}
