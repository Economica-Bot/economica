import { InfractionString } from '@economica/common';
import { EmbedBuilder, resolveColor } from 'discord.js';
import ms from 'ms';
import { client } from '..';
import { trpc } from './trpc';

export const recordInfraction = async (
	guildId: string,
	targetId: string,
	agentId: string,
	type: InfractionString,
	reason: string,
	duration?: number,
	active?: boolean
) => {
	const guildEntity = await trpc.guild.byId.query({ id: guildId });
	const infraction = await trpc.infraction.create.mutate({
		guild: { id: guildId },
		target: { userId: targetId, guildId },
		agent: { userId: agentId, guildId },
		type,
		reason,
		duration,
		active
	});
	const { infractionLogId } = guildEntity;
	if (infractionLogId) {
		const channel = await client.channels.fetch(infractionLogId);
		if (channel && channel.isTextBased()) {
			const description = `Target: <@!${targetId}> | Agent: <@!${agentId}>`;
			const embed = new EmbedBuilder()
				.setColor(resolveColor('Red'))
				.setAuthor({ name: `Infraction | ${type}` })
				.setDescription(description)
				.addFields([
					{ name: '__**Reason**__', value: reason },
					{
						name: '**Permanent**',
						value: `\`${duration === Infinity ?? 'N/A'}\``,
						inline: true
					},
					{
						name: '**Active**',
						value: `\`${infraction.active ?? 'N/A'}\``,
						inline: true
					},
					{
						name: '**Duration**',
						value: `\`${ms(duration ?? 0)}\``,
						inline: true
					}
				])
				.setFooter({ text: `ID: ${infraction.id}` })
				.setTimestamp(new Date(infraction.createdAt));
			channel.send({ embeds: [embed] });
		}
	}
};
