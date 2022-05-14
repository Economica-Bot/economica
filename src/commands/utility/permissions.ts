import { Util } from 'discord.js';

import {
	Command,
	Context,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../../structures/index.js';
import { Emojis } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('permissions')
		.setDescription('View command permission levels')
		.setModule('UTILITY')
		.setFormat('permissions <command>')
		.setExamples(['permissions infraction'])
		.setGlobal(true)
		.addStringOption((option) => option.setName('command').setDescription('Specify a command').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const commandInput = ctx.interaction.options.getString('command');
		const command = ctx.client.commands.get(commandInput);
		if (!command) {
			ctx.embedify('error', 'user', 'Could not find that command.').send(true);
			return;
		}

		const embed = ctx
			.embedify('info', 'user')
			.setAuthor({ name: `Permissions for ${command.data.name}`, iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.PERSON_ADD).id)?.url })
			.addFields([{ name: 'Base', value: `Client Permissions: \`${command.data.clientPermissions ?? '`None`'}\` Default Member Permissions: \`${command.data.default_member_permissions ?? '`None`'}\`` }]);
		command.data.options.forEach((option) => {
			if (option instanceof EconomicaSlashCommandSubcommandBuilder) {
				embed.addFields([{ name: `${command.data.name} ${option.name}`, value: `Client Permissions: \`${option.clientPermissions ?? '`None`'}\``, inline: true }]);
			} else if (option instanceof EconomicaSlashCommandSubcommandGroupBuilder) {
				embed.addFields([{ name: `${command.data.name} ${option.name}`, value: `Client Permissions: \`${option.clientPermissions ?? '`None`'}\`` }]);
				option.options.forEach((opt: EconomicaSlashCommandSubcommandBuilder) => {
					embed.addFields([{ name: `${command.data.name} ${option.name} ${opt.name}`, value: `Client Permissions: \`${opt.clientPermissions ?? '`None`'}\``, inline: true }]);
				});
			}
		});

		ctx.interaction.reply({ embeds: [embed] });
	};
}
