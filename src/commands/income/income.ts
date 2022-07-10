import { parseString } from '@adrastopoulos/number-parser';
import { parseEmoji, PermissionFlagsBits } from 'discord.js';

import { collectProp } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis, IncomeCommand } from '../../typings';

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
				.setExecution(async (ctx, interaction) => {
					const embed = ctx.embedify('info', 'guild', 'Income command information');
					Object.entries(ctx.guildEntity.incomes).forEach((income) => {
						const description = Object.entries(income[1]).map((prop) => `${prop[0]}: ${prop[1]}`);
						embed.addFields([{ name: income[0], value: `\`\`\`${description.join('\n')}\`\`\``, inline: true }]);
					});
					await interaction.update({ embeds: [embed], components: [] });
				}),
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
						.setOptions(Object.keys(ctx.guildEntity.incomes[cmd]).map((property: keyof IncomeCommand) => new ExecutionBuilder()
							.setName(property)
							.setValue(property)
							.setDescription(`The \`${property}\` property of \`${cmd}\``)
							.setExecution(async (ctx, interaction) => {
								const embed = ctx
									.embedify('info', 'user')
									.setAuthor({ name: `Income Command Configuration | ${cmd}:${property}` })
									.setThumbnail(ctx.client.emojis.resolve(parseEmoji(Emojis.MONEY_BRIEFCASE).id).url);

								const prop = await collectProp(ctx, interaction, embed, property.toString(), [{ function: (input) => !!parseString(input), error: 'Could not parse input' }], (input) => parseString(input));
								if (prop === null) return;
								ctx.guildEntity.incomes[cmd][property] = prop;
								await ctx.guildEntity.save();
								const successEmbed = ctx.embedify('success', 'user', `${Emojis.CHECK} **Successfully updated the \`${property}\` property to \`${prop}\` on command \`${cmd}\`.**`);
								await interaction.editReply({ embeds: [successEmbed], components: [] });
							}))),
				),
		]);
}
