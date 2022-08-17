import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';
import { FindOptionsWhere } from 'typeorm';

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
			const user = ctx.interaction.options?.getUser('user', false);
			const where: FindOptionsWhere<Infraction>[] = user
				? [{ guild: { id: ctx.interaction.guildId }, agent: { userId: user.id } }, { guild: { id: ctx.interaction.guildId }, target: { userId: user.id } }]
				: [{ guild: { id: ctx.interaction.guildId } }];
			const infractions = await Infraction.find({ relations: ['target', 'agent'], where, order: { createdAt: 'DESC' } });
			const options: typeof ExecutionNode.prototype.options = [];
			if (user) {
				const outgoing = infractions.filter((infraction) => infraction.agent.userId === user.id);
				const incoming = infractions.filter((infraction) => infraction.target.userId === user.id);
				options.push(
					['select', `/user/${user.id}/outgoing`, 'Outgoing', `View infractions wherein this user was the agent. \`${outgoing.length}\` total`],
					['select', `/user/${user.id}/incoming`, 'Incoming', `View infractions wherein this user was the target. \`${incoming.length}\` total`],
				);
			} else {
				options.push(...infractions.map((infraction) => [
					'select',
					`/view/${infraction.id}`,
					`Infraction \`${infraction.id}\` | *${infraction.type}*`,
					`>>> ${Emojis.PERSON_ADD} **Target**: <@!${infraction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${infraction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(infraction.createdAt.getTime() / 1000)}:R>`,
				] as const));
			}
			return new ExecutionNode()
				.setName('infractions')
				.setDescription('View and manage infractions')
				.setOptions(...options);
		})
		.get('/user/:userId/:type', async (ctx, params) => {
			const { userId, type } = params;
			const where: FindOptionsWhere<Infraction> = type === 'outgoing'
				? { guild: { id: ctx.guildEntity.id }, agent: { userId } }
				: { guild: { id: ctx.guildEntity.id }, target: { userId } };
			const infractions = await Infraction.find({ relations: ['target', 'agent'], where });
			return new ExecutionNode()
				.setName('Infractions')
				.setDescription(`Viewing <@${userId}>'s \`${type}\` infractions`)
				.setOptions(
					...infractions.map((infraction) => [
						'select',
						`/view/${infraction.id}`,
						`Infraction \`${infraction.id}\` | *${infraction.type}*`,
						`>>> ${Emojis.PERSON_ADD} **Target**: <@!${infraction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${infraction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(infraction.createdAt.getTime() / 1000)}:R>`,
					] as const),
					['back', ''],
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
			await Infraction.delete({ id });
			return new ExecutionNode()
				.setName('Deleting...')
				.setDescription(`${Emojis.CHECK} **Infraction Deleted**`)
				.setOptions(['back', '']);
		});
}
