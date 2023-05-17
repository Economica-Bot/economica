import { Emojis, IncomeCommand, IncomeString } from '@economica/common';
import { datasource, Guild } from '@economica/db';
import {
	ActionRowBuilder,
	EmbedBuilder,
	ModalBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { z } from 'zod';
import zodError from 'zod-validation-error';
import { Command } from '../structures/commands';

export const Income = {
	identifier: /^income$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const subcommand = interaction.options.getSubcommand();
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		if (subcommand === 'view') {
			const embed = new EmbedBuilder().setTitle('Income command information');
			Object.entries(guildEntity.incomes).forEach((income) => {
				const description = Object.entries(income[1])
					.filter(([, val]) => !!val)
					.map((prop) => `${prop[0]}: ${prop[1]}`);
				embed.addFields([
					{
						name: income[0],
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
				.setDescription('Editing income command configurations');
			const select = new StringSelectMenuBuilder().setCustomId(
				`income_edit_select:${interaction.user.id}`
			);
			Object.keys(guildEntity.incomes).forEach((command) => {
				embed.addFields({
					name: command,
					value: `The \`${command}\` income command`
				});
				select.addOptions([
					{ label: command, value: `income_edit_${command}` }
				]);
			});
			const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
				select
			);
			await interaction.reply({ embeds: [embed], components: [row] });
		}
	}
} satisfies Command<'chatInput'>;

export const IncomeEdit = {
	identifier: /^income_edit_(.*)$/,
	type: 'selectMenu',
	execute: async (interaction) => {
		const command = /^income_edit_(.*)$/
			.exec(interaction.values[0])
			?.at(1) as IncomeString;
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const modal = new ModalBuilder()
			.setCustomId(`income_result_${command}`)
			.setTitle(`Edit ${command}`)
			.setComponents(
				Object.entries(guildEntity.incomes[command])
					.filter(([, v]) => !!v)
					.map((prop) =>
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
} satisfies Command<'selectMenu'>;

const validators = {
	max: z.coerce.number().int().positive(),
	chance: z.coerce.number().int().positive().max(100),
	minfine: z.coerce.number().int().positive(),
	maxfine: z.coerce.number().int().positive(),
	cooldown: z.coerce.number().int().positive()
} as const;

export const IncomeSubmit = {
	identifier: /^income_result_(.*)$/,
	type: 'modal',
	execute: async (interaction) => {
		const command = /^income_result_(.*)$/
			.exec(interaction.customId)
			?.at(1) as IncomeString;
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const embed = new EmbedBuilder().setTitle(
			`Income Command Updated: ${command}`
		);
		await Promise.all(
			Object.entries(guildEntity.incomes[command])
				.filter(([, v]) => !!v)
				.map(async ([k]) => {
					const key = k as keyof IncomeCommand;
					const oldValue = guildEntity.incomes[command][key];
					const newValue = interaction.fields.getTextInputValue(key);
					const validation = await validators[key]
						.parseAsync(newValue)
						.catch((err: z.ZodError) => zodError.fromZodError(err));
					let msg: string;
					if (validation instanceof zodError.ValidationError) {
						msg = `${key}: \`${oldValue}\` → \`${validation}\` ${Emojis.CROSS}`;
					} else {
						guildEntity.incomes[command][key] = validation;
						msg = `${key}: \`${oldValue}\` → \`${validation}\` ${Emojis.CHECK}`;
					}

					embed.addFields({
						name: msg,
						value: '‎'
					});
				})
		);

		await datasource.getRepository(Guild).save(guildEntity);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'modal'>;
