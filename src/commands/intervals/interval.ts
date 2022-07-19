import { parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { IntervalCommand } from '../../typings';

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
						.setOptions(Object.keys(ctx.guildEntity.intervals[cmd]).map((property: keyof IntervalCommand) => new ExecutionBuilder()
							.setName(property)
							.setValue(property)
							.setDescription(`The \`${property}\` property of \`${cmd}\``)
							.collectVar((collector) => collector
								.setProperty(property)
								.setPrompt(`Input a new ${property}`)
								.addValidator((msg) => !!parseString(msg.content), 'Could not parse input.')
								.setParser((msg) => parseString(msg.content)))
							.setExecution(async (ctx) => {
								const res = this.execute.getVariable(property);
								ctx.guildEntity.intervals[cmd][property] = res;
								await ctx.guildEntity.save();
								return new ExecutionBuilder()
									.setName('Success')
									.setValue('success')
									.setDescription(`Successfully updated the \`${property}\` property to \`${res}\` on command \`${cmd}\`.`);
							}))),
				),
		]);
}
