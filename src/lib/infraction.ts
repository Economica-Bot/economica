import { MessageEmbed, TextChannel } from 'discord.js';

import { Guild, Infraction, Member } from '../models';
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
	guild: Guild,
	target: Member,
	agent: Member,
	type: InfractionString,
	reason: string,
	permanent?: boolean,
	active?: boolean,
	duration?: number
) {
	target.infractions.push({
		guild,
		target,
		agent,
		type,
		reason,
		permanent,
		active,
		duration,
	});
	await target.save();
	const { infractionLogChannelId } = guild;
	if (infractionLogChannelId) {
		const channel = client.channels.cache.get(infractionLogChannelId) as TextChannel;
		const guild = channel.guild;
		const member = guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has('SEND_MESSAGES') || !channel.permissionsFor(member).has('EMBED_LINKS')) {
			return;
		}

		const description = `Infraction for <@!${target.userId}> | Executed by <@!${agent.userId}>\nType: \`${type}\`\n${reason}`;
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor({ name: 'Infraction', iconURL: guild.iconURL() })
			.setDescription(description);
			
		channel.send({
			embeds: [embed],
		});
	}
}
