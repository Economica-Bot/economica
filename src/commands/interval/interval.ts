import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

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
			.addIntegerOption((option) => option.setName('amount').setDescription('Specify the amount').setMinValue(1).setRequired(false))
			.addBooleanOption((option) => option.setName('enabled').setDescription('Whether the command should be enabled').setRequired(false)));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const embed = ctx.embedify('info', 'guild', 'Income command information');
			Object.entries(ctx.guildEntity.intervals).forEach((interval) => {
				const description = Object.entries(interval[1]).map((prop) => `\`${prop[0]}: ${prop[1]}\``);
				embed.addField(interval[0], description.join('\n'), true);
			});
			await ctx.interaction.reply({ embeds: [embed] });
		} if (subcommand === 'edit') {
			const commandQuery = ctx.interaction.options.getString('command');
			const command = ctx.client.commands.get(commandQuery);
			const amount = ctx.interaction.options.getInteger('amount', false);
			const enabled = ctx.interaction.options.getBoolean('enabled', false);
			if (!command) {
				await ctx.embedify('error', 'user', 'Could not find that command.').send(true);
			} if (commandQuery in Object.keys(ctx.guildEntity.intervals)) {
				await ctx.embedify('error', 'user', 'That is not an `INTERVAL` command.').send(true);
			} else {
				if (amount) ctx.guildEntity.intervals[command.data.name].amount = amount;
				if (typeof enabled !== 'undefined') ctx.guildEntity.intervals[command.data.name].enabled = enabled;
				await ctx.guildEntity.save();
				await ctx.embedify('success', 'user', `Updated \`${command.data.name}\`.`).send();
			}
		}
	};
}
