import {
	Command,
	Context,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../../structures';
import { icons } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('permissions')
		.setDescription('View command authority levels')
		.setModule('UTILITY')
		.setFormat('<command>')
		.addStringOption((option) => option.setName('command').setDescription('Specify a command').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const commandInput = ctx.interaction.options.getString('command');
		const command = ctx.client.commands.get(commandInput);
		if (!command) return ctx.embedify('error', 'user', 'Could not find that command.', true);
		const data = command.data as EconomicaSlashCommandBuilder;
		const embed = ctx.embedify('info', { name: `Permissions for ${command.data.name}`, iconURL: icons.INFO });
		embed.addField('Base', `Client Permissions: \`${data.clientPermissions ?? '`None`'}\` Authority Level: \`${data.authority ?? '`None`'}\``);
		data.options.forEach((option) => {
			if (option instanceof EconomicaSlashCommandSubcommandBuilder) {
				embed.addField(`${command.data.name}:${option.name}`, `Client Permissions: \`${option.clientPermissions ?? '`None`'}\`\nAuthority Level: \`${option.authority ?? '`None`'}\``, true);
			} else if (option instanceof EconomicaSlashCommandSubcommandGroupBuilder) {
				embed.addField(`${command.data.name}:${option.name}`, `Client Permissions: \`${option.clientPermissions ?? '`None`'}\`\nAuthority Level: \`${option.authority ?? '`None`'}\``);
				option.options.forEach((opt: EconomicaSlashCommandSubcommandBuilder) => {
					embed.addField(`${command.data.name}:${option.name}:${opt.name}`, `Client Permissions: \`${opt.clientPermissions ?? '`None`'}\` Authority Level: \`${opt.authority ?? '`None`'}\``, true);
				});
			}
		});

		return ctx.interaction.reply({ embeds: [embed] });
	};
}
