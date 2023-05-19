import { Emojis, IntervalCommand, IntervalString } from '@economica/common';
import { datasource, Guild } from '@economica/db';
import {
	ActionRowBuilder,
	EmbedBuilder,
	ModalBuilder,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { z } from 'zod';
import zodError from 'zod-validation-error';
import { Command } from '../structures/commands';

export const Interval = {
	identifier: /^interval$/,
	type: 'chatInput',
	execute: async ({ interaction, guildEntity }) => {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const embed = new EmbedBuilder().setTitle('Interval command information');
			Object.entries(guildEntity.intervals).forEach((interval) => {
				const description = Object.entries(interval[1]).map(
					(prop) => `${prop[0]}: ${prop[1]}`
				);
				embed.addFields([
					{
						name: interval[0],
						value: `\`\`\`${description.join('\n')}\`\`\``,
						inline: true
					}
				]);
			});
			await interaction.reply({ embeds: [embed] });
		}
		if (subcommand === 'edit') {
			const embed = new EmbedBuilder()
				.setTitle('Edit')
				.setDescription('Editing Interval Command Configurations');
			const select = new StringSelectMenuBuilder().setCustomId(
				`interval_select:${interaction.user.id}`
			);
			Object.keys(guildEntity.intervals).forEach((command) => {
				embed.addFields({
					name: command,
					value: `The \`${command}\` interval command`
				});
				select.addOptions([
					{ label: command, value: `interval_edit_${command}` }
				]);
			});
			const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents(
				select
			);
			await interaction.reply({ embeds: [embed], components: [row] });
		}
	}
} satisfies Command<'chatInput'>;

export const IntervalEdit = {
	identifier: /^interval_edit_(?<command>(.*))$/,
	type: 'selectMenu',
	execute: async ({ interaction, guildEntity, args }) => {
		const command = args.groups.command as IntervalString;
		const modal = new ModalBuilder()
			.setCustomId(`interval_result_${command}`)
			.setTitle(`Edit ${command}`)
			.setComponents(
				Object.entries(guildEntity.intervals[command]).map((prop) =>
					new ActionRowBuilder<TextInputBuilder>().setComponents(
						new TextInputBuilder()
							.setCustomId(prop[0])
							.setStyle(TextInputStyle.Short)
							.setLabel(prop[0])
							.setRequired(true)
							.setValue(String(prop[1]))
					)
				)
			);
		await interaction.showModal(modal);
	}
} satisfies Command<'selectMenu', true, 'command'>;

const validator = {
	amount: z.coerce.number().int().positive(),
	cooldown: z.coerce.number().int().positive(),
	enabled: z.preprocess((a) => a === 'true', z.boolean())
} as const;

export const IntervalSubmit = {
	identifier: /^interval_result_(?<command>(.*))$/,
	type: 'modal',
	execute: async ({ interaction, args, guildEntity }) => {
		const command = args.groups.command as IntervalString;
		const embed = new EmbedBuilder().setTitle(
			`Interval Command Updated: ${command}`
		);
		await Promise.all(
			Object.entries(guildEntity.intervals[command]).map(async ([k]) => {
				const key = k as keyof IntervalCommand;
				const oldValue = guildEntity.intervals[command][key];
				const newValue = interaction.fields.getTextInputValue(key);
				const validation = await validator[key]
					.parseAsync(newValue)
					.catch((err: z.ZodError) => zodError.fromZodError(err).message);
				let msg: string;
				if (typeof validation !== 'string') {
					Reflect.set(guildEntity.intervals[command], key, validation);
					msg = `${key}: \`${oldValue}\` → \`${validation.toString()}\` ${
						Emojis.CHECK
					}`;
				} else
					msg = `${key}: \`${oldValue}\` → \`${validation}\` ${Emojis.CROSS}`;
				embed.addFields({
					name: msg,
					value: '‎'
				});
			})
		);

		await datasource.getRepository(Guild).save(guildEntity);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'modal', true, 'command'>;
