import { Moderation } from '@economica/common';
import { ChatInputCommandInteraction } from 'discord.js';

export async function validateTarget(
	interaction: ChatInputCommandInteraction<'cached'>,
	memberRequired = true
) {
	const type = interaction.commandName as Moderation;
	const member = await interaction.guild.members.fetchMe();
	const target = interaction.options.getMember('target');
	const targetUser = interaction.options.getUser('target', true);
	if (!target && (!targetUser || memberRequired))
		throw new Error('Target not found');
	if (targetUser.id === interaction.user.id)
		throw new Error('You cannot target yourself');
	if (targetUser.id === interaction.client.user.id)
		throw new Error('You cannot target me');
	if (target) {
		if (target.roles.highest.position > member.roles.highest.position)
			throw new Error("Target's roles are too high");
		if (type === 'ban' && !target.bannable)
			throw new Error('Target is unbannable');
		if (type === 'kick' && !target.kickable)
			throw new Error('Target is unkickable');
		if (type === 'timeout') {
			if (!target.moderatable) throw new Error('Target is unmoderatable');
			if (target.isCommunicationDisabled())
				throw new Error('Target is already in a timeout');
		} else if (type === 'untimeout' && !target.isCommunicationDisabled())
			throw new Error('Target is not in a timeout');
	}

	return target;
}
