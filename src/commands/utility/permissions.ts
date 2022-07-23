import { parseEmoji, PermissionsBitField } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('permissions')
		.setDescription('View command permission levels')
		.setModule('UTILITY')
		.setFormat('permissions <command>')
		.setExamples(['permissions infraction'])
		.setGlobal(true)
		.addStringOption((option) => option.setName('command').setDescription('Specify a command').setRequired(true));

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const commandInput = ctx.interaction.options.getString('command');
		const command = ctx.client.commands.get(commandInput);
		if (!command) {
			await ctx.embedify('error', 'user', 'Could not find that command.').send(true);
			return;
		}

		await ctx
			.embedify(
				'info',
				'user',
				`Client Permissions: \`${command.data.clientPermissions.length ? command.data.clientPermissions.join(', ') : 'None'}\`\n`
				+ `Member Permissions: \`${command.data.default_member_permissions ? new PermissionsBitField(BigInt(command.data.default_member_permissions)).toArray() : 'None'}\``,
			)
			.setAuthor({
				name: `Permissions for ${command.data.name}`,
				iconURL: ctx.client.emojis.resolve(parseEmoji(Emojis.PERSON_ADD).id)?.url,
			})
			.send();
	});
}
