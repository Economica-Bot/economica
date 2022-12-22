import { CommandData, Emojis } from '@economica/common';
import { datasource, Guild } from '@economica/db';
import {
	ActionRowBuilder,
	EmbedBuilder,
	parseEmoji,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from 'discord.js';
import { env } from '../env.mjs';
import { Command } from '../structures/commands.js';

export const Help = {
	identifier: /^help$/,
	type: 'chatInput',
	async execute(interaction) {
		const query = interaction.options.getString('query');
		if (!query) {
			const helpEmbed = new EmbedBuilder()
				.setAuthor({
					name: 'Economica Help Dashboard',
					iconURL: interaction.client.user.displayAvatarURL()
				})
				.setDescription(
					`${Emojis.GEM} **Welcome to the ${interaction.client.user} Help Dashboard!**\nHere, you can get information about any command or module. Use the select menu below to specify a module.\n\n${Emojis.MENU} **The Best New Discord Economy Bot**\nTo become more familiar with Economica, please refer to the [documentation](${env.DOCS_URL}). There you can set up various permissions-related settings and get detailed information about all command modules.\n\n🔗 **Useful Links**:\n**[Home Page](${env.HOME_URL}) | [Command Docs](${env.COMMANDS_URL}) | [Vote For Us](${env.VOTE_URL})**`
				);
			const guildEntity = await datasource
				.getRepository(Guild)
				.findOneByOrFail({ id: interaction.guildId });
			const labels = Object.keys(guildEntity.modules).map((module) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(module)
					.setValue(`help_${module}`)
					.toJSON()
			);
			const dropdown =
				new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
					new StringSelectMenuBuilder()
						.setCustomId(`help_select:${interaction.user.id}`)
						.setPlaceholder('None Selected')
						.setOptions(labels)
				]);
			await interaction.reply({
				embeds: [helpEmbed],
				components: [dropdown],
				fetchReply: true
			});

			return;
		}

		const command = CommandData.find(
			(c) => c.name.toLowerCase() === query.toLowerCase()
		);
		if (!command) throw new Error(`Could not find command \`${query}\``);

		const commandEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${command.name} | ${command.description}`,
				iconURL: interaction.client.emojis.resolve(parseEmoji(Emojis.COGS)!.id!)
					?.url
			})
			.setDescription(
				`${Emojis.FOCUS} **Format**: \`${command.format}\`\n${
					Emojis.TEXTING
				} **Examples**: \`\`\`${command.examples.join('\n')}\`\`\``
			)

			.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL()
			})
			.setTimestamp();
		command.options?.forEach((option) => {
			if (option instanceof SlashCommandSubcommandBuilder) {
				commandEmbed.addFields([
					{
						name: `${command.name} ${option.name}`,
						value: option.description
					}
				]);
			} else if (option instanceof SlashCommandSubcommandGroupBuilder) {
				commandEmbed.addFields([
					{ name: `${command.name} ${option.name}`, value: option.description }
				]);
				option.options.forEach((opt: SlashCommandSubcommandBuilder) => {
					commandEmbed.addFields([
						{
							name: `${command.name} ${option.name} ${opt.name}`,
							value: opt.description,
							inline: true
						}
					]);
				});
			}
		});
		await interaction.reply({ embeds: [commandEmbed] });
	}
} satisfies Command<'chatInput'>;

export const HelpSelect = {
	identifier: /^help_(.*)$/,
	type: 'selectMenu',
	execute: async (interaction) => {
		const module = /^help_(.*)$/.exec(interaction.values[0])?.at(1);
		const description = CommandData.filter(
			(command) => command.module === module
		)
			.map((command) => `**${command.name}**\n> ${command.description}`)
			.join('\n');
		const moduleEmbed = new EmbedBuilder()
			.setAuthor({ name: `${module} Module` })
			.setDescription(description.length ? description : 'No commands found');
		await interaction.reply({
			embeds: [moduleEmbed.toJSON()]
		});
	}
} satisfies Command<'selectMenu'>;
