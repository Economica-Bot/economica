import { codeBlock, PermissionsBitField } from 'discord.js';

import { WEBSITE_COMMANDS_URL, WEBSITE_DOCS_URL, WEBSITE_HOME_URL, WEBSITE_VOTE_URL } from '../../config';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';
import { defaultModulesObj, Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription('Get information about a command or module')
		.setModule('UTILITY')
		.setFormat('help [command]')
		.setExamples(['help', 'help permissions'])
		.setGlobal(true);

	public execution = new ExecutionNode<'top'>()
		.setName('Economica Help Dashboard')
		.setValue('help')
		.setDescription(
			`${Emojis.GEM} **Welcome to the Economica Help Dashboard!**\nHere, you can get information about any command or module. Use the select menu below to specify a module.\n\n${Emojis.MENU} **The Best New Discord Economy Bot**\nTo become more familiar with Economica, please refer to the [documentation](${WEBSITE_DOCS_URL}). There you can set up various permissions-related settings and get detailed information about all command modules.\n\n🔗 **Useful Links**:\n**[Home Page](${WEBSITE_HOME_URL}) | [Command Docs](${WEBSITE_COMMANDS_URL}) | [Vote For Us](${WEBSITE_VOTE_URL})**`,
		)
		.setOptions((ctx) => Object
			.keys(ctx.guildEntity?.modules ?? defaultModulesObj)
			.map((module) => new ExecutionNode()
				.setName(module)
				.setValue(`help_${module}`)
				.setType('select')
				.setDescription(`Listing \`${module}\` commands.`)
				.setOptions((ctx) => Array
					.from(ctx.interaction.client.commands.filter((cmd) => cmd.data.module === module).values())
					.map((command) => new ExecutionNode()
						.setName(`**${command.data.name}** | *${command.data.description}*`)
						.setValue(`help.${command.data.name}`)
						.setType('display')
						.setDescription(`>>> ${Emojis.FOCUS} **Format**: \`${command.data.format}\`\n${Emojis.TEXTING} **Examples**: ${codeBlock(command.data.examples.join('\n'))}**Permissions**: ${new PermissionsBitField(BigInt(command.data.default_member_permissions ?? 0)).toArray().map((permission) => `\`${permission}\``)}`)))));
}
