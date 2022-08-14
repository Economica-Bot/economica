import { parseString } from '@adrastopoulos/number-parser';
import { codeBlock } from 'discord.js';
import ms from 'ms';

import { Command, EconomicaSlashCommandBuilder, ExecutionNode, VariableCollector } from '../../structures';
import { Emojis, IncomeCommand } from '../../typings';

const collectors: Record<keyof IncomeCommand, (collector: VariableCollector) => VariableCollector> = {
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
		]);

	public execution = new ExecutionNode()
		.setName('Income')
		.setValue('income')
		.setDescription('View and manipulate income commands')
		.setOptions(() => [
			new ExecutionNode()
				.setName('View')
				.setValue('income_view')
				.setType('select')
				.setDescription('View income command information')
				.setOptions((ctx) => Object
					.keys(ctx.guildEntity.incomes)
					.map((cmd) => new ExecutionNode()
						.setName(cmd)
						.setValue(`income_view_${cmd}`)
						.setType('displayInline')
						.setDescription(
							codeBlock(Object.entries(ctx.guildEntity.incomes[cmd])
								.map((prop) => `${prop[0]}: ${prop[1]}`)
								.join('\n')),
						))),
			new ExecutionNode()
				.setName('Edit')
				.setValue('income_edit')
				.setType('select')
				.setDescription('Edit income command configurations')
				.setPredicate((ctx) => ctx.interaction.member.permissions.has(['ManageGuild']))
				.setOptions(
					async (ctx) => Object.keys(ctx.guildEntity.incomes).map((cmd) => new ExecutionNode()
						.setName(cmd)
						.setValue(`income_edit_${cmd}`)
						.setType('select')
						.setDescription(`The \`${cmd}\` income command`)
						.setOptions(() => Object
							.keys(ctx.guildEntity.incomes[cmd])
							.map((property: keyof IncomeCommand) => new ExecutionNode()
								.setName(property)
								.setValue(`income_edit_${cmd}_${property}`)
								.setType('select')
								.setDescription(`The \`${property}\` property of \`${cmd}\``)
								.collectVar(collectors[property])
								.setExecution(async (ctx) => {
									ctx.guildEntity.incomes[cmd][property] = ctx.variables[property];
									await ctx.guildEntity.save();
								})
								.setOptions((ctx) => [
									new ExecutionNode()
										.setName('Update Success')
										.setValue('income_edit_result')
										.setType('display')
										.setDescription(`${Emojis.CHECK} **Successfully updated the \`${property}\` property to \`${ctx.guildEntity.incomes[cmd][property]}\` on command \`${cmd}\`.**`),
								])))),
				),
		]);
}
