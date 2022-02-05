import { MessageEmbed, TextChannel } from 'discord.js';

import { GuildModel, InfractionModel } from '../models';
import { EconomicaClient } from '../structures';
import { InfractionString } from '../typings';

/**
 * Record an infraction.
 * @param {EconomicaClient} client - The Client.
 * @param {string} guildId - Guild id.
 * @param {string} userId - User id.
 * @param {string} agentId - Agent/Staff id.
 * @param {string} type - The punishment for the infraction.
 * @param {string} reason - The reason for the punishment.
 * @param {boolean} permanent - Whether the punishment is permanent.
 * @param {boolean} active - Whehther the punishment is active.
 * @param {number} length - The length of the punishment.
 */
export async function infraction(
	client: EconomicaClient,
	guildId: string,
	userId: string,
	agentId: string,
	type: InfractionString,
	reason: string,
	permanent?: boolean,
	active?: boolean,
	duration?: number
) {
	const infraction = await InfractionModel.create({
		guildId,
		userId,
		agentId,
		type,
		reason,
		permanent,
		active,
		duration,
	});

	const guildSetting = await GuildModel.findOne({ guildId });
	const { infractionLogChannelId } = guildSetting;

	if (infractionLogChannelId) {
		const channel = client.channels.cache.get(infractionLogChannelId) as TextChannel;
		const guild = channel.guild;
		const member = guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has('SEND_MESSAGES') || !channel.permissionsFor(member).has('EMBED_LINKS')) {
			return;
		}

		const description = `Infraction for <@!${userId}> | Executed by <@!${agentId}>\nType: \`${type}\`\n${reason}`;
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor({ name: infraction._id.toString(), iconURL: guild.iconURL() })
			.setDescription(description)
			.setTimestamp();

		channel.send({
			embeds: [embed],
		});
	}
}
