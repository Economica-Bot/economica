import { MessageEmbed, TextChannel } from 'discord.js';

import { Guild, Member } from '../models/index.js';
import { Economica } from '../structures/index.js';
import { InfractionString } from '../typings/index.js';

/**
 * Record an infraction.
 * @param {Economica} client - The Client.
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
	client: Economica,
	guild: Guild,
	target: Member,
	agent: Member,
	type: InfractionString,
	reason: string,
	permanent?: boolean,
	active?: boolean,
	duration?: number,
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
	const { infractionLogId } = guild;
	if (infractionLogId) {
		const channel = client.channels.cache.get(infractionLogId) as TextChannel;
		const { guild } = channel;
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
