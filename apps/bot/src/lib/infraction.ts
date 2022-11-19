import { InfractionString } from '@economica/common';
import { Guild, Infraction, Member } from '@economica/db';
import { ChannelType } from 'discord-api-types/v10';
import { Client, EmbedBuilder } from 'discord.js';
import ms from 'ms';

export function displayInfraction(infraction: Infraction) {
	const {
		id,
		type,
		target,
		agent,
		reason,
		duration,
		active,
		permanent,
		createdAt
	} = infraction;
	const description = `Target: <@!${target.userId}> | Agent: <@!${agent.userId}>`;
	return new EmbedBuilder()
		.setAuthor({ name: `Infraction | ${type}` })
		.setDescription(description)
		.addFields([
			{ name: '__**Reason**__', value: reason },
			{
				name: '**Permanent**',
				value: `\`${permanent ?? 'N/A'}\``,
				inline: true
			},
			{ name: '**Active**', value: `\`${active ?? 'N/A'}\``, inline: true },
			{ name: '**Duration**', value: `\`${ms(duration ?? 0)}\``, inline: true }
		])
		.setFooter({ text: `ID: ${id}` })
		.setTimestamp(createdAt);
}

/**
 * Record an infraction.
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
	client: Client,
	guild: Guild,
	target: Member,
	agent: Member,
	type: InfractionString,
	reason: string,
	active?: boolean,
	duration?: number,
	permanent?: boolean
) {
	const infractionEntity = await Infraction.create({
		guild,
		target,
		agent,
		type,
		reason,
		active,
		duration,
		permanent
	}).save();
	const { infractionLogId } = guild;
	if (infractionLogId) {
		const embed = displayInfraction(infractionEntity);
		const channel = await client.channels.fetch(infractionLogId);
		if (!channel || channel.type !== ChannelType.GuildText) return;
		await channel.send({ embeds: [embed] });
	}
}
