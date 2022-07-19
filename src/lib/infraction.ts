import { EmbedBuilder, PermissionFlagsBits, resolveColor, TextChannel } from 'discord.js';
import ms from 'ms';

import { Guild, Infraction, Member } from '../entities';
import { Economica } from '../structures';
import { InfractionString } from '../typings';

/**
 * Display an infraction
 * @param infraction - The infraction to display
 * @returns {EmbedBuilder}
 */
export function displayInfraction(infraction: Infraction) {
	const { id, type, target, agent, reason, duration, active, permanent, createdAt } = infraction;
	const description = `Target: <@!${target.userId}> | Agent: <@!${agent.userId}>`;
	return new EmbedBuilder()
		.setColor(resolveColor('Red'))
		.setAuthor({ name: `Infraction | ${type}` })
		.setDescription(description)
		.addFields([
			{ name: '__**Reason**__', value: reason },
			{ name: '**Permanent**', value: `\`${permanent ?? 'N/A'}\``, inline: true },
			{ name: '**Active**', value: `\`${active ?? 'N/A'}\``, inline: true },
			{ name: '**Duration**', value: `\`${ms(duration ?? 0)}\``, inline: true },
		])
		.setFooter({ text: `ID: ${id}` })
		.setTimestamp(createdAt);
}

/**
 * Record an infraction.
 * @param {Economica} client - The Client.
 * @param {string} guild - Guild id.
 * @param {string} target - User id.
 * @param {string} agent - Agent/Staff id.
 * @param {string} type - The punishment for the infraction.
 * @param {string} reason - The reason for the punishment.
 * @param {boolean} active - Whehther the punishment is active.
 * @param {number} duration - The length of the punishment.
 * @param {boolean} permanent - Whether the punishment is permanent.
 */
export async function recordInfraction(
	client: Economica,
	guild: Guild,
	target: Member,
	agent: Member,
	type: InfractionString,
	reason: string,
	active?: boolean,
	duration?: number,
	permanent?: boolean,
) {
	const infractionEntity = await Infraction.create({ guild, target, agent, type, reason, active, duration, permanent }).save();
	const { infractionLogId } = guild;
	if (infractionLogId) {
		const channel = client.channels.cache.get(infractionLogId) as TextChannel;
		const member = channel.guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has(PermissionFlagsBits.SendMessages) || !channel.permissionsFor(member).has(PermissionFlagsBits.EmbedLinks)) return;
		const embed = displayInfraction(infractionEntity);
		await channel.send({ embeds: [embed] });
	}
}
