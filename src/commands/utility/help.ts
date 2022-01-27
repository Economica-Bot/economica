import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';

import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription('List commands, or information about a command group, command, subcommand group, or subcommand.')
		.setGroup('utility')
		.setFormat('[command]')
		.setExamples(['help', 'help ban'])
		.setGlobal(true)
		.addStringOption((option) =>
			option.setName('query').setDescription('Specify a group, command, or subcommand.').setRequired(false)
		);

	execute = async (ctx: Context) => {
		const query = ctx.interaction.options.getString('query');

		if (!query) {
			const commands: EconomicaSlashCommandBuilder[] = [];
			const groups: string[] = [];

			ctx.client.commands.forEach((command) => {
				const data = command.data as EconomicaSlashCommandBuilder;
				if (!groups.includes(data.group)) groups.push(data.group);
				commands.push(data);
			});

			const embed: MessageEmbed = await ctx.embedify('info', 'guild', 'Command List.', false);

			for (const group of groups) {
				const list: string[] = [];
				for (const command of commands) {
					if (command.group === group) list.push(command.name);
				}

				embed.addField(group, `\`${list.join('`, `')}\``);
			}

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		const subcommand = (
			ctx.client.commands.find((command) => {
				const data = command.data as EconomicaSlashCommandBuilder;
				return data.getSubcommand(query) !== undefined;
			})?.data as EconomicaSlashCommandBuilder
		)?.getSubcommand(query) as EconomicaSlashCommandSubcommandBuilder;

		const subcommandGroup = (
			ctx.client.commands.find((command) => {
				const data = command.data as EconomicaSlashCommandBuilder;
				return data.getSubcommand(subcommand?.name) !== undefined || data.getSubcommandGroup(query) !== undefined;
			})?.data as EconomicaSlashCommandBuilder
		)?.getSubcommandGroup(subcommand?.name || query) as EconomicaSlashCommandSubcommandGroupBuilder;

		const command = ctx.client.commands.find((command) => {
			const data = command.data as EconomicaSlashCommandBuilder;
			return (
				data.name === query ||
				data.getSubcommand(subcommand?.name) !== undefined ||
				data.getSubcommandGroup(subcommandGroup?.name) !== undefined
			);
		});

		const { group } = ctx.client.commands.find((cmd) => {
			const data = cmd.data as EconomicaSlashCommandBuilder;
			return (
				data.group === query ||
				data.getSubcommand(subcommand?.name) !== undefined ||
				data.getSubcommandGroup(subcommandGroup?.name) !== undefined ||
				data.name === command?.data?.name
			);
		})?.data as EconomicaSlashCommandBuilder;

		if (group && !command) {
			const embed: MessageEmbed = await ctx.embedify('info', 'user', null, false)
			for (const command of ctx.client.commands) {
				const data = command[1].data as EconomicaSlashCommandBuilder;
				if (data.group === group) {
					embed.addField(data.name, `>>> *${data.description}* \n${data.format ? `Format: \`${data.format}\`` : ''}`);
				}
			}

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		if (command && !subcommandGroup) {
			const data = command.data as EconomicaSlashCommandBuilder;
			const embed = new MessageEmbed()
				.setAuthor({
					name: `${group}:${data.name}`,
					iconURL: ctx.client.user.displayAvatarURL(),
				})
				.setColor('YELLOW')
				.setDescription(`${data.description}`)
				.addField('Format', data.format ? `\`${data.format}\`` : 'none', true)
				.addField('Examples', data.examples ? `\`${data.examples.join('`\n`')}\`` : 'none', true)
				.addField('Servers Only?', data.global ? '`False`' : '`True`', true);

			data.options.forEach((option) => {
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

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		if (subcommandGroup && !subcommand) {
			const data = command.data as EconomicaSlashCommandBuilder;
			const embed = new MessageEmbed()
				.setAuthor({
					name: `${group}:${data.name}:${subcommandGroup.name}`,
					iconURL: ctx.client.user.displayAvatarURL(),
				})
				.setColor('YELLOW')
				.setDescription(`${subcommandGroup.description}`);
			for (const subcommand of subcommandGroup.options as EconomicaSlashCommandSubcommandBuilder[]) {
				embed.addField(
					subcommand.name,
					`> *${subcommand.description}* \n${subcommand.format ? `Format: \`${subcommand.format}\`` : ''}`
				);
			}

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		if (subcommand) {
			const data = command.data as EconomicaSlashCommandBuilder;
			const embed = new MessageEmbed()
				.setAuthor({
					name: `${group}:${data.name}:${subcommandGroup.name}:${subcommand.name}`,
					iconURL: ctx.client.user.displayAvatarURL(),
				})
				.setColor('YELLOW')
				.setDescription(subcommand.description)
				.addField('Format', subcommand.format ? `\`${subcommand.format}\`` : 'None', true)
				.addField('Examples', subcommand.examples ? `\`${subcommand.examples.join('`\n`')}\`` : 'None', true);

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		return await ctx.interaction.reply(
			`Could not find any groups, commands, subcommand groups, or subcommands matching \`${query}\`.`
		);
	};
}
