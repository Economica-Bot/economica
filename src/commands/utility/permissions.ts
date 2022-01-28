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
		.setGroup('utility')
		.setFormat('<command>')
		.addStringOption((option) => option.setName('command').setDescription('Specify a command.').setRequired(true));

	execute = async (ctx: Context) => {
		const commandInput = ctx.interaction.options.getString('command');
		const command = ctx.client.commands.get(commandInput);
		if (!command) {
			return await ctx.interaction.reply('Could not find that command.');
		}

		const data = command.data as EconomicaSlashCommandBuilder;

		let description = `**${data.name} Command Permissions**\n__User Permissions__:\n\`${
			data.userPermissions ?? '`None`'
		}\`\n__Client Permissions:__\n\`${data.clientPermissions ?? '`None`'}\`\n__Roles:__\n\`${
			data.roles ?? '`None`'
		}\`\n\n`;

		if (data.getSubcommandGroup()) {
			(data.getSubcommandGroup() as EconomicaSlashCommandSubcommandGroupBuilder[]).forEach((subcommandGroupData) => {
				description += `**${subcommandGroupData.name} Subcommand Group Permissions**\n__User Permissions:__\n\`${
					subcommandGroupData.userPermissions ?? '`None`'
				}\`\n__Client Permissions:__\n\`${subcommandGroupData.clientPermissions ?? '`None`'}\`\n__Roles:__\n\`${
					subcommandGroupData.roles ?? '`None`'
				}\`\n\n`;
			});
		}

		if (data.getSubcommand()) {
			(data.getSubcommand() as EconomicaSlashCommandSubcommandBuilder[]).forEach((subcommandData) => {
				description += `**${subcommandData.name} Subcommand Permissions**\n__User Permissions:__\n\`${
					subcommandData.userPermissions ?? '`None`'
				}\`\n__Client Permissions:__\n\`${subcommandData.clientPermissions ?? '`None`'}\`\n__Roles:__\n\`${
					subcommandData.roles ?? '`None`'
				}\`\n\n`;
			});
		}

		return await ctx.embedify('info', 'bot', description);
	};
}
