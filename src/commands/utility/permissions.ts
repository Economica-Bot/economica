import { icons } from '../../config';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('permission')
		.setDescription('See the permissions of a command.')
		.setGroup('UTILITY')
		.setFormat('<command>')
		.addStringOption((option) => option.setName('command').setDescription('Specify a command.').setRequired(true));

	execute = async (ctx: Context) => {
		const commandInput = ctx.interaction.options.getString('command');
		const command = ctx.client.commands.get(commandInput);
		if (!command) return await ctx.embedify('error', 'user', 'Could not find that command.');

		const data = command.data as EconomicaSlashCommandBuilder;
		const embed = ctx.embedify('info', { name: `Permissions for ${data.name}`, iconURL: icons.info });
		embed.addField(
			'Base',
			`Client Permissions: \`${data.clientPermissions ?? '`None`'}\`
		    Authority Level: \`${data.authority ?? '`None`'}\``
		);

		data.options.forEach((option) => {
			if (option instanceof EconomicaSlashCommandSubcommandBuilder) {
				embed.addField(
					`${data.name}:${option.name}`,
					`Client Permissions: \`${option.clientPermissions ?? '`None`'}\`
					Authority Level: \`${option.authority ?? '`None`'}\``,
					true
				);
			} else if (option instanceof EconomicaSlashCommandSubcommandGroupBuilder) {
				embed.addField(
					`${data.name}:${option.name}`,
					`Client Permissions: \`${option.clientPermissions ?? '`None`'}\`
					Authority Level: \`${option.authority ?? '`None`'}\``
				);
				option.options.forEach((opt: EconomicaSlashCommandSubcommandBuilder) => {
					embed.addField(
						`${data.name}:${option.name}:${opt.name}`,
						`Client Permissions: \`${opt.clientPermissions ?? '`None`'}\`
						Authority Level: \`${opt.authority ?? '`None`'}\``,
						true
					);
				});
			}
		});

		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
