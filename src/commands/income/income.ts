import { parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder, VariableCollector } from '../../structures';
import { Emojis, IncomeCommand } from '../../typings';

const validators: Record<
keyof IncomeCommand,
{
	validators: Parameters<Pick<VariableCollector, 'addValidator'>['addValidator']>[];
} & Pick<VariableCollector, 'parse'>
> = {
	chance: {
		validators: [
			[(msg) => !!parseFloat(msg.content), 'Could not parse percentage.'],
			[
				(msg) => parseFloat(msg.content) <= 100 && parseFloat(msg.content) >= 0,
				'Chance must be between 0 and 100, inclusive.',
			],
		],
		parse: (msg) => parseFloat(msg.content),
	},
	cooldown: {
		validators: [
			[(msg) => !!ms(msg.content), 'Invalid cooldown time submitted.'],
			[(msg) => ms(msg.content) > 0, 'Cooldown must be greater than 0.'],
		],
		parse: (msg) => ms(msg.content),
	},
	max: {
		validators: [
			[(msg) => !!parseString(msg.content), 'Could not parse input'],
			[(msg) => parseString(msg.content) > 0, 'Input must be greater than 0.'],
		],
		parse: (msg) => parseString(msg.content),
	},
	maxfine: {
		validators: [
			[(msg) => !!parseString(msg.content), 'Could not parse input'],
			[(msg) => parseString(msg.content) > 0, 'Input must be greater than 0.'],
		],
		parse: (msg) => parseString(msg.content),
	},
	min: {
		validators: [
			[(msg) => !!parseString(msg.content), 'Could not parse input'],
			[(msg) => parseString(msg.content) > 0, 'Input must be greater than 0.'],
		],
		parse: (msg) => parseString(msg.content),
	},
	minfine: {
		validators: [
			[(msg) => !!parseString(msg.content), 'Could not parse input'],
			[(msg) => parseString(msg.content) > 0, 'Input must be greater than 0.'],
		],
		parse: (msg) => parseString(msg.content),
	},
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
		])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execute = new ExecutionBuilder()
		.setName('Income')
		.setValue('income')
		.setDescription('Manipulate income commands')
		.setOptions([
			new ExecutionBuilder()
				.setName('View')
				.setValue('view')
				.setDescription('View income command information')
				.setPagination(
					(ctx) => Object.keys(ctx.guildEntity.incomes),
					(cmd, ctx) => new ExecutionBuilder()
						.setName(cmd)
						.setValue(cmd)
						.setDescription(
							`\`\`\`${Object.entries(ctx.guildEntity.incomes[cmd])
								.map((prop) => `${prop[0]}: ${prop[1]}`)
								.join('\n')}\`\`\``,
						),
				),
			new ExecutionBuilder()
				.setName('Edit')
				.setValue('edit')
				.setDescription('Edit income command configurations')
				.setPermissions(['ManageGuild'])
				.setPagination(
					async (ctx) => Object.keys(ctx.guildEntity.incomes),
					(cmd, ctx) => new ExecutionBuilder()
						.setName(cmd)
						.setValue(cmd)
						.setDescription(`The \`${cmd}\` income command`)
						.setOptions(
							Object.keys(ctx.guildEntity.incomes[cmd]).map((property: keyof IncomeCommand) => new ExecutionBuilder()
								.setName(property)
								.setValue(property)
								.setDescription(`The \`${property}\` property of \`${cmd}\``)
								.collectVar((collector) => {
									collector
										.setProperty(property)
										.setPrompt(`Enter a new ${property}`)
										.setParser(validators[property].parse);
									validators[property].validators.forEach((validator) => collector.addValidator(...validator));
									return collector;
								})
								.setExecution(async (ctx, interaction) => {
									ctx.guildEntity.incomes[cmd][property] = this.execute.getVariable(property);
									await ctx.guildEntity.save();
									const successEmbed = ctx.embedify(
										'success',
										'user',
										`${Emojis.CHECK} **Successfully updated the \`${property}\` property to \`${ctx.guildEntity.incomes[cmd][property]}\` on command \`${cmd}\`.**`,
									);
									await interaction.editReply({ embeds: [successEmbed], components: [] });
								})),
						),
				),
		]);
}
