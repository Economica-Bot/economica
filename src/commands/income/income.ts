import ms from 'ms';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('income')
		.setDescription('Manipulate income commands')
		.setModule('INCOME')
		.setFormat('income <view | edit> [...arguments]')
		.setExamples([
			'income view',
			'income edit work minimum: 100',
			'income edit crime maxfine: 20%',
			'income edit beg cooldown: 5m',
		])
		.addSubcommand((subcommand) => subcommand
			.setName('view').setDescription('View income command configurations'))
		.addSubcommand((subcommand) => subcommand
			.setName('edit')
			.setDescription('Edit income command configs')
			.setAuthority('MANAGER')
			.addStringOption((option) => option.setName('command').setDescription('Specify the comman.').setRequired(true))
			.addIntegerOption((option) => option.setName('minimum').setDescription('Specify the minimum value').setMinValue(0))
			.addIntegerOption((option) => option.setName('maximum').setDescription('Specify the maximum value').setMinValue(1))
			.addIntegerOption((option) => option.setName('chance').setDescription('Specify a chance').setMinValue(1).setMaxValue(100))
			.addIntegerOption((option) => option.setName('minfine').setDescription('Specify the minimum fine').setMinValue(0))
			.addIntegerOption((option) => option.setName('maxfine').setDescription('Specify the maximum fine').setMinValue(1).setMaxValue(100))
			.addStringOption((option) => option.setName('cooldown').setDescription('Specify the cooldown')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const embed = ctx.embedify('info', 'guild', 'Income command information');
			Object.entries(ctx.guildEntity.incomes).forEach((income) => {
				const description = Object.entries(income[1]).map((prop) => `\`${prop[0]}: ${prop[1]}\``);
				embed.addField(income[0], description.join('\n'));
			});
			await ctx.interaction.reply({ embeds: [embed] });
		} if (subcommand === 'edit') {
			const min = ctx.interaction.options.getInteger('minimum', false);
			const max = ctx.interaction.options.getInteger('maximum', false);
			const chance = ctx.interaction.options.getInteger('chance', false);
			const minfine = ctx.interaction.options.getInteger('minfine', false);
			const maxfine = ctx.interaction.options.getInteger('maxfine', false);
			const cooldown = ctx.interaction.options.getString('cooldown', false);
			const commandQuery = ctx.interaction.options.getString('command');
			const command = ctx.client.commands.get(commandQuery);
			if (!command) {
				await ctx.embedify('error', 'user', 'Could not find that command.', true);
			} if (commandQuery in Object.keys(ctx.guildEntity.incomes)) {
				await ctx.embedify('error', 'user', 'That is not an `INCOME` command.', true);
			} else {
				Object.keys(ctx.guildEntity.incomes).forEach((cmd) => {
					if (cmd === commandQuery) {
						if (min && 'min' in ctx.guildEntity.incomes[cmd]) ctx.guildEntity.incomes[cmd].min = min;
						if (max && 'max' in ctx.guildEntity.incomes[cmd]) ctx.guildEntity.incomes[cmd].max = max;
						if (chance && 'chance' in ctx.guildEntity.incomes[cmd]) ctx.guildEntity.incomes[cmd].chance = chance;
						if (minfine && 'minfine' in ctx.guildEntity.incomes[cmd]) ctx.guildEntity.incomes[cmd].minfine = minfine;
						if (maxfine && 'maxfine' in ctx.guildEntity.incomes[cmd]) ctx.guildEntity.incomes[cmd].maxfine = maxfine;
						if (cooldown && 'cooldown' in ctx.guildEntity.incomes[cmd] && ms(cooldown)) ctx.guildEntity.incomes[cmd].cooldown = ms(cooldown);
					}
				});

				await ctx.guildEntity.save();
				await ctx.embedify('success', 'user', `Updated \`${commandQuery}\`.`, false);
			}
		}
	};
}
