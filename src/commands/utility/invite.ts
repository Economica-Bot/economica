import { CommandInteraction, MessageEmbed } from 'discord.js';
import { EconomicaClient, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica.')
		.setGroup('utility')
		.setGlobal(true)
		.setEnabled(false);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor('GOLD')
					.setAuthor({ name: client.user.username, url: client.user.displayAvatarURL() })
					.setDescription(
						`Invite link: __[Click Here](${process.env.INVITE_LINK} 'Invite Economica')__`
					),
			],
		});
	};
}
