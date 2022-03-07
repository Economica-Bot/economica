import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { defaultIntervals } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('interval')
		.setDescription('Manage the interval commands')
		.setModule('INTERVAL')
		.setFormat('interval <view | edit> [...arguments]')
		.setExamples(['interval view', 'interval edit daily 100'])
		.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View interval command configurations'))
		.addSubcommand((subcommand) => subcommand
			.setName('edit')
			.setDescription('Edit interval command configs.')
			.setAuthority('MANAGER')
			.addStringOption((option) => option.setName('command').setDescription('Specify the command').setRequired(true))
			.addIntegerOption((option) => option.setName('funds').setDescription('Specify the funds').setMinValue(1).setRequired(true)));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const embed = ctx.embedify('info', 'guild', 'Income command information');
			Object.entries(ctx.guildEntity.intervals).forEach((interval) => {
				const description = Object.entries(interval[1]).map((prop) => `\`${prop[0]}: ${prop[1]}\``);
				embed.addField(interval[0], description.join('\n'));
			});
			await ctx.interaction.reply({ embeds: [embed] });
		} if (subcommand === 'edit') {
			const funds = ctx.interaction.options.getInteger('funds');
			const commandQuery = ctx.interaction.options.getString('command');
			const command = ctx.client.commands.get(commandQuery);
			if (!command) {
				await ctx.embedify('error', 'user', 'Could not find that command.', true);
			} if (commandQuery in Object.keys(ctx.guildEntity.intervals)) {
				await ctx.embedify('error', 'user', 'That is not an `INTERVAL` command.', true);
			} else {
				Object.keys(ctx.guildEntity.intervals).forEach((interval: keyof defaultIntervals) => {
					if (interval === command.data.name) ctx.guildEntity.intervals[interval].amount = funds;
				});
				await ctx.guildEntity.save();
				await ctx.embedify('success', 'user', `Updated \`${command}\`.`, false);
			}
		}
	};
}
