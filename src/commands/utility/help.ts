import { codeBlock, PermissionsBitField } from 'discord.js';

import { WEBSITE_COMMANDS_URL, WEBSITE_DOCS_URL, WEBSITE_HOME_URL, WEBSITE_VOTE_URL } from '../../config';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { defaultModulesObj, Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription('Get information about a command or module')
		.setModule('UTILITY')
		.setFormat('help [command]')
		.setExamples(['help', 'help permissions'])
		.setGlobal(true);

	public execution = new Router()
		.get('', (ctx) => new ExecutionNode()
			.setName('Economica Help Dashboard')
			.setDescription(
				`${Emojis.GEM} **Welcome to the Economica Help Dashboard!**\nHere, you can get information about any command or module. Use the select menu below to specify a module.\n\n${Emojis.MENU} **The Best New Discord Economy Bot**\nTo become more familiar with Economica, please refer to the [documentation](${WEBSITE_DOCS_URL}). There you can set up various permissions-related settings and get detailed information about all command modules.\n\n🔗 **Useful Links**:\n**[Home Page](${WEBSITE_HOME_URL}) | [Command Docs](${WEBSITE_COMMANDS_URL}) | [Vote For Us](${WEBSITE_VOTE_URL})**`,
			)
			.setOptions(...Object
				.keys(ctx.guildEntity?.modules ?? defaultModulesObj)
				.map((module) => ['select', `/${module}`, module, `View the \`${module}\` commands`] as const)))
		.get('/:module', (ctx, params) => new ExecutionNode()
			.setName(params.module)
			.setDescription(`Listing \`${params.module}\` Commands`)
			.setOptions(
				...Array
					.from(ctx.interaction.client.commands.filter((cmd) => cmd.metadata.module === params.module).values())
					.map((command) => [
						'display',
						`**${command.metadata.name}** | *${command.metadata.description}*`,
						`>>> ${Emojis.FOCUS} **Format**: \`${command.metadata.format}\`\n${Emojis.TEXTING} **Examples**: ${codeBlock(command.metadata.examples.join('\n'))}**Permissions**: ${new PermissionsBitField(BigInt(command.metadata.default_member_permissions ?? 0)).toArray().map((permission) => `\`${permission}\``)}`,
					] as const),
				['back', `/${params.module}`],
			));
}
