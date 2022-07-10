import { parseString } from '@adrastopoulos/number-parser';
import { parseEmoji, PermissionFlagsBits } from 'discord.js';

import { collectProp } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis, IntervalCommand } from '../../typings';

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
							.setExecution(async (ctx, interaction) => {
								const embed = ctx
									.embedify('info', 'user')
									.setAuthor({ name: 'Interval Command Configuration' })
									.setThumbnail(ctx.client.emojis.resolve(parseEmoji(Emojis.TIME).id).url);

								const prop = await collectProp(ctx, interaction, embed, property.toString(), [{ function: (input) => !!parseString(input), error: 'Could not parse input' }], (input) => parseString(input));
								ctx.guildEntity.intervals[cmd][property] = prop;
								await ctx.guildEntity.save();

								return new ExecutionBuilder()
									.setName('Success')
									.setValue('success')
									.setDescription(`Successfully updated the \`${property}\` property on command \`${cmd}\`.`);
							}))),
				),
		]);
}
