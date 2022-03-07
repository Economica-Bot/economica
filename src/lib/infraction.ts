import { MessageEmbed, TextChannel } from 'discord.js';
import ms from 'ms';

import { Guild, Infraction, Member } from '../entities';
import { Economica } from '../structures/index.js';
import { InfractionString } from '../typings/index.js';

/**
 * Display an infraction
 * @param infraction - The infraction to display
 * @returns {MessageEmbed}
 */
export async function displayInfraction(infraction: Infraction): Promise<MessageEmbed> {
	const { id, type, target, agent, reason, duration, active, permanent, createdAt } = infraction;
	const description = `Target: <@!${target.user.id}> | Agent: <@!${agent.user.id}>`;
	return new MessageEmbed()
		.setColor('RED')
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
export async function infraction(
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
		if (!channel.permissionsFor(member).has('SEND_MESSAGES') || !channel.permissionsFor(member).has('EMBED_LINKS')) return;
		const embed = await displayInfraction(infractionEntity);
		await channel.send({ embeds: [embed] });
	}
}
