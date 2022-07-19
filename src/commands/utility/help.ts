import { EmbedBuilder, parseEmoji } from 'discord.js';

import { WEBSITE_COMMANDS_URL, WEBSITE_DOCS_URL, WEBSITE_HOME_URL, WEBSITE_VOTE_URL } from '../../config';
import {
	Command,
	EconomicaSlashCommandBuilder,
	ExecutionBuilder,
} from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription('Get information about a command or module')
		.setModule('UTILITY')
		.setFormat('help [command]')
		.setExamples(['help', 'help permissions'])
		.setGlobal(true);

	public execute = new ExecutionBuilder()
		.setName('Economica Help Dashboard')
		.setValue('help')
		.setDescription(`${Emojis.GEM} **Welcome to the Economica Help Dashboard!**\nHere, you can get information about any command or module. Use the select menu below to specify a module.\n\n${Emojis.MENU} **The Best New Discord Economy Bot**\nTo become more familiar with Economica, please refer to the [documentation](${WEBSITE_DOCS_URL}). There you can set up various permissions-related settings and get detailed information about all command modules.\n\n🔗 **Useful Links**:\n**[Home Page](${WEBSITE_HOME_URL}) | [Command Docs](${WEBSITE_COMMANDS_URL}) | [Vote For Us](${WEBSITE_VOTE_URL})**`)
		.setPagination(
			(ctx) => Object.keys(ctx.guildEntity.modules),
			(module) => new ExecutionBuilder()
				.setName(module)
				.setValue(module)
				.setDescription(`Listing \`${module}\` commands.`)
				.setPagination(
					async (ctx) => Array.from(ctx.client.commands.filter((cmd) => cmd.data.module === module).values()),
					(command) => new ExecutionBuilder()
						.setName(command.data.name)
						.setValue(command.data.name)
						.setDescription(command.data.description)
						.setExecution(async (ctx, interaction) => {
							const commandEmbed = new EmbedBuilder()
								.setAuthor({ name: `${command.data.name} | ${command.data.description}`, iconURL: ctx.client.emojis.resolve(parseEmoji(Emojis.COGS).id)?.url })
								.setDescription(`${Emojis.FOCUS} **Format**: \`${command.data.format}\`\n${Emojis.TEXTING} **Examples**: \`\`\`${command.data.examples.join('\n')}\`\`\``)
								.setFooter({ text: ctx.interaction.user.tag, iconURL: ctx.interaction.user.displayAvatarURL() })
								.setTimestamp();

							await interaction.update({ embeds: [commandEmbed], components: [] });
						}),
				),
		);
}
