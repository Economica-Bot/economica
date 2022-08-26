import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { Infraction } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('infraction')
		.setDescription('View and manage infractions')
		.setModule('MODERATION')
		.setFormat('infraction')
		.setExamples(['infraction'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user'));

	public execution = new Router()
		.get('', async (ctx) => {
			const user = ctx.interaction.options.getUser('user', false);
			if (user) return `/user/${user.id}`;
			const infractions = await Infraction.find({ relations: ['target', 'agent'], where: { guild: { id: ctx.interaction.guildId } }, order: { createdAt: 'DESC' } });
			return new ExecutionNode()
				.setName('Infractions')
				.setDescription('Viewing all infractions')
				.setOptions(...infractions.map((infraction) => [
					'select',
					`/view/${infraction.id}`,
					`Infraction \`${infraction.id}\` | *${infraction.type}*`,
					`>>> ${Emojis.PERSON_ADD} **Target**: <@!${infraction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${infraction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(infraction.createdAt.getTime() / 1000)}:R>`,
				] as const));
		})
		.get('/user/:userId', async (ctx, params) => {
			const { userId } = params;
			const infractions = await Infraction.find({
				relations: ['target', 'agent'],
				where: [
					{ guild: { id: ctx.guildEntity.id }, agent: { userId } },
					{ guild: { id: ctx.guildEntity.id }, target: { userId } },
				],
			});
			return new ExecutionNode()
				.setName('Infractions')
				.setDescription(`Viewing <@${userId}>'s infractions`)
				.setOptions(
					...infractions.map((infraction) => [
						'select',
						`/view/${infraction.id}`,
						`Infraction \`${infraction.id}\` | *${infraction.type}*`,
						`>>> ${Emojis.PERSON_ADD} **Target**: <@!${infraction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${infraction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(infraction.createdAt.getTime() / 1000)}:R>`,
					] as const),
				);
		})
		.get('/view/:id', async (ctx, params) => {
			const { id } = params;
			const infraction = await Infraction.findOne({ relations: ['target', 'agent'], where: { id } });
			return new ExecutionNode()
				.setName(`infraction ${infraction.id} | ${infraction.type}`)
				.setDescription(`>>> ${Emojis.PERSON_ADD} **Target**: <@!${infraction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${infraction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(infraction.createdAt.getTime() / 1000)}:R>`)
				.setOptions(
					['display', '__**Reason**__', `*${infraction.reason}*`],
					['displayInline', '__**Permanent**__', `\`${infraction.permanent ?? 'N/A'}\``],
					['displayInline', '__**Active**__', `\`${infraction.active ?? 'N/A'}\``],
					['displayInline', '__**Duration**__', `\`${ms(infraction.duration ?? 0)}\``],
					['button', `/view/${id}/delete`, 'Delete'],
					['back', ''],
				);
		})
		.get('/view/:id/delete', async (ctx, params) => {
			const { id } = params;
			const transaction = await Infraction.findOne({ relations: ['target'], where: { id } });
			return new ExecutionNode()
				.setName('Deleting...')
				.setDescription(`${Emojis.CHECK} **Infraction Deleted**`)
				.setOptions(['back', `/user/${transaction.target.userId}`]);
		});
}
