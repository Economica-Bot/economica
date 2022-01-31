import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';

import { icons } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription('List commands, or information about a command group, command, subcommand group, or subcommand.')
		.setGroup('UTILITY')
		.setFormat('[command]')
		.setExamples(['help', 'help ban'])
		.setGlobal(true)
		.addStringOption((option) =>
			option.setName('query').setDescription('Specify a group, command, or subcommand.').setRequired(false)
		);

	execute = async (ctx: Context): Promise<Message | void> => {
		const query = ctx.interaction.options.getString('query');

		if (!query) {
			const commands: EconomicaSlashCommandBuilder[] = [];
			const groups: string[] = [];

			ctx.client.commands.forEach((command) => {
				const data = command.data as EconomicaSlashCommandBuilder;
				if (!groups.includes(data.group)) groups.push(data.group);
				commands.push(data);
			});

			const embed = ctx.embedify('info', 'bot', 'Command List.');

			for (const group of groups) {
				const list: string[] = [];
				for (const command of commands) {
					if (command.group === group) list.push(command.name);
				}

				embed.addField(group, `\`${list.join('`, `')}\``);
			}

			return await ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const command = ctx.client.commands.find((command) => {
			const data = command.data as EconomicaSlashCommandBuilder;
			return data.name.toLowerCase() === query.toLowerCase();
		})?.data as EconomicaSlashCommandBuilder;

		const group = (
			ctx.client.commands.find((cmd) => {
				const data = cmd.data as EconomicaSlashCommandBuilder;
				return (
					data.group.toLocaleLowerCase() === query.toLowerCase() ||
					data.name.toLowerCase() === command?.name?.toLocaleLowerCase()
				);
			})?.data as EconomicaSlashCommandBuilder
		)?.group;

		if (group && !command) {
			const embed = ctx.embedify('info', { name: group, iconURL: ctx.client.user.displayAvatarURL() });
			for (const command of ctx.client.commands) {
				const data = command[1].data as EconomicaSlashCommandBuilder;
				if (data.group === group) {
					embed.addField(data.name, `>>> *${data.description}*${data.format ? `\nFormat: \`${data.format}\`` : ''}`);
				}
			}

			return await ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (command) {
			const embed = ctx
				.embedify('info', { name: `${group}:${command.name}`, iconURL: icons.info }, command.description)
				.addField('Format', command.format ? `\`${command.format}\`` : 'none', true)
				.addField('Examples', command.examples ? `\`${command.examples.join('`\n`')}\`` : 'none', true)
				.addField('Servers Only?', command.global ? '`False`' : '`True`', true);

			command.options.forEach((option) => {
				if (option instanceof SlashCommandSubcommandGroupBuilder) {
					const scsgb = option;
					const subcommands: string[] = [];
					for (const option of scsgb.options as SlashCommandSubcommandBuilder[]) {
						subcommands.push(`**${option.name}**\n> *${option.description}*`);
					}
					embed.addField(option.name, subcommands.join('\n'), true);
				} else if (option instanceof SlashCommandSubcommandBuilder) {
					const scsb = option;
					embed.addField(scsb.name, `> *${scsb.description}*`, true);
				}
			});

			return await ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		}

		return await ctx.embedify('error', 'user', `Could not find any groups or commands matching \`${query}\`.`, true);
	};
}
