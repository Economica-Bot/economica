import { InfractionString } from '@economica/common';
import { datasource, Guild, Infraction } from '@economica/db';
import { EmbedBuilder, resolveColor } from 'discord.js';
import ms from 'ms';
import { client } from '..';

export const recordInfraction = async (
	guildId: string,
	targetId: string,
	agentId: string,
	type: InfractionString,
	reason: string,
	duration?: number,
	active?: boolean
) => {
	const guildEntity = await datasource
		.getRepository(Guild)
		.findOneByOrFail({ id: guildId });
	const infraction = datasource.getRepository(Infraction).create({
		guild: { id: guildId },
		target: { userId: targetId, guildId },
		agent: { userId: agentId, guildId },
		type,
		reason,
		duration,
		active
	});
	await datasource.getRepository(Infraction).save(infraction);
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
				.setTimestamp(infraction.createdAt);
			channel.send({ embeds: [embed] });
		}
	}
};
