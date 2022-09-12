import { parseString } from '@adrastopoulos/number-parser';
import { codeBlock } from 'discord.js';
import ms from 'ms';

import { VariableCollector } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis, IncomeCommand } from '../../typings';

const collectors: Record<keyof IncomeCommand, (collector: VariableCollector<any>) => VariableCollector<any>> = {
	chance: (collector) => collector
		.setProperty('chance')
		.setPrompt('Specify the success chance of this command.')
		.addValidator((msg) => !!parseFloat(msg.content), 'Could not parse percentage.')
		.addValidator((msg) => parseFloat(msg.content) <= 100 && parseFloat(msg.content) >= 0, 'Chance must be between 0 and 100, inclusive.')
		.setParser((msg) => parseFloat(msg.content)),
	cooldown: (collector) => collector
		.setProperty('cooldown')
		.setPrompt('The length of time between this command\'s execution.')
		.addValidator((msg) => !!ms(msg.content), 'Invalid cooldown time submitted.')
		.addValidator((msg) => ms(msg.content) > 0, 'Cooldown must be greater than 0.')
		.setParser((msg) => ms(msg.content)),
	max: (collector) => collector
		.setProperty('max')
		.setPrompt('The maximum amount of money received upon command usage.')
		.addValidator((msg) => !!parseString(msg.content), 'Could not parse input')
		.addValidator((msg) => parseString(msg.content) > 0, 'Input must be greater than 0.')
		.setParser((msg) => parseString(msg.content)),
	maxfine: (collector) => collector
		.setProperty('max')
		.setPrompt('The maximum amount of money charged.')
		.addValidator((msg) => !!parseString(msg.content), 'Could not parse input')
		.addValidator((msg) => parseString(msg.content) > 0, 'Input must be greater than 0.')
		.setParser((msg) => parseString(msg.content)),
	min: (collector) => collector
		.setProperty('max')
		.setPrompt('The minimum amount of money received upon command usage.')
		.addValidator((msg) => !!parseString(msg.content), 'Could not parse input')
		.addValidator((msg) => parseString(msg.content) > 0, 'Input must be greater than 0.')
		.setParser((msg) => parseString(msg.content)),
	minfine: (collector) => collector
		.setProperty('max')
		.setPrompt('The minimum amount of money charged.')
		.addValidator((msg) => !!parseString(msg.content), 'Could not parse input')
		.addValidator((msg) => parseString(msg.content) > 0, 'Input must be greater than 0.')
		.setParser((msg) => parseString(msg.content)),
};

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('income')
		.setDescription('Manipulate income commands')
		.setModule('INCOME')
		.setFormat('income <view | edit> [...arguments]')
		.setExamples([
			'income view',
			'income edit work minimum: 100',
			'income edit crime maxfine: 20%',
			'income edit beg cooldown: 5m',
		]);

	public execution = new Router()
		.get('', () => new ExecutionNode()
			.setName('Income')
			.setDescription('View and manipulate income commands')
			.setOptions(
				['select', '/view', 'View', 'View income command settings'],
				['select', '/edit', 'Edit', 'Edit income command settings'],
			))
		.get('/view', (ctx) => new ExecutionNode()
			.setName('View')
			.setDescription('Viewing income command configurations')
			.setOptions(
				...Object
					.keys(ctx.guildEntity.incomes)
					.map((income) => [
						'displayInline',
						income,
						codeBlock(Object.entries(ctx.guildEntity.incomes[income])
							.map((prop) => `${prop[0]}: ${prop[1]}`)
							.join('\n')),
					] as const),
				['back', ''],
			))
		.get('/edit', (ctx) => new ExecutionNode()
			.setName('Edit')
			.setDescription('Editing income command configurations')
			.setOptions(
				...Object
					.keys(ctx.guildEntity.incomes)
					.map((cmd) => ['select', `/edit/${cmd}`, cmd, `The \`${cmd}\` income command`] as const),
				['back', ''],
			))
		.get('/edit/:command', (ctx, params) => {
			const { command } = params;
			return new ExecutionNode()
				.setName(command)
				.setDescription(`Editing the \`${command}\` income command`)
				.setOptions(
					...Object
						.keys(ctx.guildEntity.incomes[command])
						.map((prop: keyof IncomeCommand) => ['select', `/edit/${command}/${prop}`, prop, `The \`${prop}\` property of \`${command}\``] as const),
					['back', '/edit'],
				);
		})
		.get('/edit/:command/:property', async (ctx, params) => {
			const { command, property } = params;
			const value = await collectors[property](new VariableCollector()).execute(ctx);
			ctx.guildEntity.incomes[command][property] = value;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Update Success')
				.setDescription(`${Emojis.CHECK} **Successfully updated the \`${property}\` property to \`${ctx.guildEntity.incomes[command][property]}\` on command \`${command}\`.**`)
				.setOptions(['back', `/edit/${command}`]);
		});
}
