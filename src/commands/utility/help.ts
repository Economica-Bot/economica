import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from '@discordjs/builders';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { icons } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription('Get information about a command or module')
		.setModule('UTILITY')
		.setFormat('[command | module]')
		.setExamples(['help', 'help permissions', 'help moderation'])
		.setGlobal(true)
		.addStringOption((option) => option.setName('query').setDescription('Specify a module, command, or subcommand.').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('query');
		if (!query) {
			const commands: EconomicaSlashCommandBuilder[] = [];
			const modules: string[] = [];
			ctx.guildDocument.modules.forEach((module) => {
				ctx.client.commands.filter((cmd) => {
					const data = cmd.data as EconomicaSlashCommandBuilder;
					return data.module === module;
				}).forEach((command) => {
					const data = command.data as EconomicaSlashCommandBuilder;
					if (!modules.includes(data.module)) modules.push(data.module);
					commands.push(data);
				});
			});

			const embed = ctx.embedify('info', 'bot', 'Command List.');
			modules.forEach((module) => {
				const list = commands.map((command) => command.module === module);
				embed.addField(module, `\`${list.join('`, `')}\``);
			});

			return ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const command = ctx.client.commands.find(({ data }) => data.name.toLowerCase() === query.toLowerCase())?.data as EconomicaSlashCommandBuilder;
		if (command) {
			const embed = ctx
				.embedify('info', { name: `${module}:${command.name}`, iconURL: icons.INFO }, command.description)
				.addField('Format', command.format ? `\`${command.format}\`` : 'none', true)
				.addField('Examples', command.examples ? `\`${command.examples.join('`\n`')}\`` : 'none', true)
				.addField('Servers Only?', command.global ? '`False`' : '`True`', true);

			command.options.forEach((option) => {
				if (option instanceof SlashCommandSubcommandGroupBuilder) {
					const subcommands = option.options.map((opt: SlashCommandSubcommandBuilder) => `**${opt.name}**\n> *${opt.description}*`);
					embed.addField(option.name, subcommands.join('\n'), true);
				} else if (option instanceof SlashCommandSubcommandBuilder) {
					embed.addField(option.name, `> *${option.description}*`, true);
				}
			});

			return ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		}

		return ctx.embedify('error', 'user', `Could not find any modules or commands matching \`${query}\`.`, true);
	};
}
