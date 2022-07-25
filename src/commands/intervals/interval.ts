import { parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder, VariableCollector } from '../../structures';
import { IntervalCommand } from '../../typings';

const collectors: Record<keyof IntervalCommand, (collector: VariableCollector) => VariableCollector> = {
	amount: (collector) => collector
		.setProperty('amount')
		.setPrompt('The amount of money received upon command usage.')
		.addValidator((msg) => !!parseString(msg.content), 'Could not parse input')
		.addValidator((msg) => parseString(msg.content) > 0, 'Input must be greater than 0.')
		.setParser((msg) => parseString(msg.content)),
	cooldown: (collector) => collector
		.setProperty('cooldown')
		.setPrompt('The length of time between this interval command\'s execution.')
		.addValidator((msg) => !!ms(msg.content), 'Invalid cooldown time submitted.')
		.addValidator((msg) => ms(msg.content) > 0, 'Cooldown must be greater than 0.')
		.setParser((msg) => ms(msg.content)),
	enabled: (collector) => collector
		.setProperty('enabled')
		.setPrompt('Whether or not this command can be run.')
		.addValidator((msg) => ['false', 'true'].includes(msg.content.toLowerCase()), 'Input must be one of `false`, `true`.')
		.setParser((msg) => msg.content.toLowerCase() === 'true'),
};

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('interval')
		.setDescription('Manage the interval commands')
		.setModule('INTERVAL')
		.setFormat('interval <view | edit> [...arguments]')
		.setExamples(['interval view', 'interval edit daily 100'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execute = new ExecutionBuilder()
		.setName('Interval')
		.setValue('interval')
		.setDescription('Manipulate interval commands')
		.setOptions([
			new ExecutionBuilder()
				.setName('View')
				.setValue('view')
				.setDescription('View interval command information')
				.setExecution(async (ctx, interaction) => {
					const embed = ctx.embedify('info', 'guild', '**Interval Command Information**');
					Object.entries(ctx.guildEntity.intervals).forEach((interval) => {
						const description = Object.entries(interval[1]).map((prop) => `${prop[0]}: ${prop[1]}`);
						embed.addFields([{ name: interval[0], value: `\`\`\`${description.join('\n')}\`\`\``, inline: true }]);
					});
					await interaction.update({ embeds: [embed], components: [] });
				}),
			new ExecutionBuilder()
				.setName('Edit')
				.setValue('edit')
				.setDescription('Edit interval command configurations')
				.setPagination(
					async (ctx) => Object.keys(ctx.guildEntity.intervals),
					(cmd, ctx) => new ExecutionBuilder()
						.setName(cmd)
						.setValue(cmd)
						.setDescription(`The \`${cmd}\` interval command`)
						.setOptions(
							Object.keys(ctx.guildEntity.intervals[cmd]).map((property: keyof IntervalCommand) => new ExecutionBuilder()
								.setName(property)
								.setValue(property)
								.setDescription(`The \`${property}\` property of \`${cmd}\``)
								.collectVar(collectors[property])
								.setExecution(async (ctx) => {
									const res = this.execute.getVariable(property);
									ctx.guildEntity.intervals[cmd][property] = res;
									await ctx.guildEntity.save();
									return new ExecutionBuilder()
										.setName('Success')
										.setValue('success')
										.setDescription(
											`Successfully updated the \`${property}\` property to \`${res}\` on command \`${cmd}\`.`,
										);
								})),
						),
				),
		]);
}
