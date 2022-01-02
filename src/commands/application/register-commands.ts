import { CommandInteraction } from 'discord.js';
import registerCommands from '../../services/register-commands';
import { EconomicaClient, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('register-commands')
		.setDescription('Register economica commands.')
		.setGroup('application')
		.setDevOnly(true)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('guild')
				.setDescription('Refresh server commands.')
				.addStringOption((option) =>
					option.setName('guild_id').setDescription('Specify a server id').setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('global').setDescription('Refresh global commands.')
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		await interaction.deferReply({ ephemeral: true });
		const guild_id = interaction.options.getString('guild_id');
		const global = interaction.options.getSubcommand() === 'global' ? true : false;
		if (!(await client.guilds.fetch()).has(guild_id)) {
			return await interaction.editReply(`Could not find guild with ID \`${guild_id}\``);
		}
		
		await new registerCommands().execute(client, guild_id, global);
		return await interaction.editReply('Commands refreshed.');
	};
}
