import { parseString } from '@adrastopoulos/number-parser';
import { codeBlock, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { Command, EconomicaSlashCommandBuilder, ExecutionNode, VariableCollector } from '../../structures';
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

	public execution = new ExecutionNode()
		.setName('Interval')
		.setValue('interval')
		.setDescription('Manipulate interval commands')
		.setOptions(() => [
			new ExecutionNode()
				.setName('View')
				.setValue('interval_view')
				.setType('select')
				.setDescription('View interval command information')
				.setOptions((ctx) => Object
					.entries(ctx.guildEntity.intervals)
					.map((interval) => new ExecutionNode()
						.setName(interval[0])
						.setValue(`interval_view_${interval[0]}`)
						.setType('displayInline')
						.setDescription(codeBlock(Object.entries(interval[1]).map((prop) => `${prop[0]}: ${prop[1]}`).join('\n'))))),
			new ExecutionNode()
				.setName('Edit')
				.setValue('interval_edit')
				.setType('select')
				.setPredicate((ctx) => ctx.interaction.member.permissions.has('Administrator'))
				.setDescription('Edit interval command configurations')
				.setOptions(
					async (ctx) => Object
						.keys(ctx.guildEntity.intervals)
						.map((cmd) => new ExecutionNode()
							.setName(cmd)
							.setValue(`interval_${cmd}`)
							.setType('select')
							.setDescription(`The \`${cmd}\` interval command`)
							.setOptions(() => Object.keys(ctx.guildEntity.intervals[cmd]).map((property: keyof IntervalCommand) => new ExecutionNode()
								.setName(property)
								.setValue(`interval_${cmd}_${property}`)
								.setType('select')
								.setDescription(`The \`${property}\` property of \`${cmd}\``)
								.collectVar(collectors[property])
								.setExecution(async (ctx) => {
									const res = ctx.variables[property];
									ctx.guildEntity.intervals[cmd][property] = res;
									await ctx.guildEntity.save();
									ctx.variables.res = res;
								})
								.setOptions((ctx) => [
									new ExecutionNode()
										.setName('Update Success')
										.setValue(`interval_edit_${cmd}_result`)
										.setType('display')
										.setDescription(`Successfully updated the \`${property}\` property to \`${ctx.variables.res}\` on command \`${cmd}\`.`),
								])))),
				),
		]);
}
