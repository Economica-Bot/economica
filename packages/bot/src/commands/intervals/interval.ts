import { parseString } from '@adrastopoulos/number-parser';
import { codeBlock, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { VariableCollector } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis, IntervalCommand } from '../../typings';

const collectors: Record<keyof IntervalCommand, (collector: VariableCollector<any>) => VariableCollector<any>> = {
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
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('interval')
		.setDescription('Manage the interval commands')
		.setModule('INTERVAL')
		.setFormat('interval <view | edit> [...arguments]')
		.setExamples(['interval view', 'interval edit daily 100'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execution = new Router()
		.get('', () => new ExecutionNode()
			.setName('Interval')
			.setDescription('View and manipulate interval commands')
			.setOptions(
				['select', '/view', 'View', 'View interval command settings'],
				['select', '/edit', 'Edit', 'Edit interval command settings'],
			))
		.get('/view', (ctx) => new ExecutionNode()
			.setName('View')
			.setDescription('Viewing interval command configurations')
			.setOptions(
				...Object
					.keys(ctx.guildEntity.intervals)
					.map((interval) => [
						'displayInline',
						interval,
						codeBlock(Object.entries(ctx.guildEntity.intervals[interval])
							.map((prop) => `${prop[0]}: ${prop[1]}`)
							.join('\n')),
					] as const),
				['back', ''],
			))
		.get('/edit', (ctx) => new ExecutionNode()
			.setName('Edit')
			.setDescription('Editing interval command configurations')
			.setOptions(
				...Object
					.keys(ctx.guildEntity.intervals)
					.map((cmd) => ['select', `/edit/${cmd}`, cmd, `The \`${cmd}\` interval command`] as const),
				['back', ''],
			))
		.get('/edit/:command', (ctx, params) => {
			const { command } = params;
			return new ExecutionNode()
				.setName(command)
				.setDescription(`Editing the \`${command}\` interval command`)
				.setOptions(
					...Object
						.keys(ctx.guildEntity.intervals[command])
						.map((prop) => ['select', `/edit/${command}/${prop}`, prop, `The \`${prop}\` property of \`${command}\``] as const),
					['back', '/edit'],
				);
		})
		.get('/edit/:command/:property', async (ctx, params) => {
			const { command, property } = params;
			const value = await collectors[property](new VariableCollector()).execute(ctx);
			ctx.guildEntity.intervals[command][property] = value;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Update Success')
				.setDescription(`${Emojis.CHECK} **Successfully updated the \`${property}\` property to \`${ctx.guildEntity.intervals[command][property]}\` on command \`${command}\`.**`)
				.setOptions(['back', `/edit/${command}`]);
		});
}
