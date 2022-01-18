import { MessageEmbed } from 'discord.js';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica.')
		.setGroup('utility')
		.setGlobal(true)
		.setEnabled(false);

	execute = async (ctx: Context) => {
		return await ctx.interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor('GOLD')
					.setAuthor({ name: ctx.client.user.username, url: ctx.client.user.displayAvatarURL() })
					.setDescription(
						`Invite link: __[Click Here](${process.env.INVITE_LINK} 'Invite Economica')__`
					),
			],
		});
	};
}
