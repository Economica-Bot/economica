import { CommandData, Emojis } from "@economica/common";
import { EmbedBuilder, parseEmoji, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { Command } from "src/structures/commands";

export const permissions = {
	identifier: /^permissions$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const commandInput = interaction.options.getString('command', true);
		const command = CommandData.find((command) => command.name.toLowerCase() === commandInput.toLowerCase())
		if (!command) throw new Error('Could not find that command.')

		const embed = new EmbedBuilder()
			.setAuthor({ name: `Permissions for ${command.name}`, iconURL: interaction.client.emojis.resolve(parseEmoji(Emojis.PERSON_ADD)!.id!)?.url })
			.addFields([{ name: 'Base', value: `Default Member Permissions: \`${command.default_member_permissions ?? '`None`'}\`` }]);
		command.options?.forEach((option, i) => {
			if (option instanceof SlashCommandSubcommandBuilder) {
				embed.addFields([{ name: `Subcommand ${i}`, value: `${command.name} ${option.name}`, inline: true }]);
			} else if (option instanceof SlashCommandSubcommandGroupBuilder) {
				embed.addFields([{ name: `Subcommand Group ${i}`, value: `${command.name} ${option.name}` }]);
				option.options.forEach((opt: SlashCommandSubcommandBuilder) => {
					embed.addFields([{ name: `Grouped Subcommand ${i}`, value: `${command.name} ${option.name} ${opt.name}`, inline: true }]);
				});
			}
		});

		await interaction.reply({ embeds: [embed] });
	},
} satisfies Command<'chatInput'>