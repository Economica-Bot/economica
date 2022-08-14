import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';
import { FindOptionsWhere } from 'typeorm';

import { Infraction } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';
import { Emojis } from '../../typings';

const displayInfraction = (infraction: Infraction): ExecutionNode[] => [
	new ExecutionNode()
		.setName('__**Reason**__')
		.setValue('infraction_reason')
		.setType('display')
		.setDescription(`*${infraction.reason}*`),
	new ExecutionNode()
		.setName('__**Permanent**__')
		.setValue('transaction_permanent')
		.setType('displayInline')
		.setDescription(`\`${infraction.permanent ?? 'N/A'}\``),
	new ExecutionNode()
		.setName('__**Active**__')
		.setValue('transaction_active')
		.setType('displayInline')
		.setDescription(`\`${infraction.active ?? 'N/A'}\``),
	new ExecutionNode()
		.setName('__**Active**__')
		.setValue('transaction_duration')
		.setType('displayInline')
		.setDescription(`\`${ms(infraction.duration ?? 0)}\``),
];

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction')
		.setDescription('View and manage infractions')
		.setModule('MODERATION')
		.setFormat('infraction')
		.setExamples(['infraction'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

	public execution = new ExecutionNode<'top'>()
		.setName('Infractions')
		.setValue('infraction')
		.setDescription('View and manage infractions')
		.setOptions(async (ctx) => {
			const user = ctx.interaction.options.getUser('user', false);
			const where: FindOptionsWhere<Infraction>[] = user
				? [{ guild: { id: ctx.interaction.guildId }, agent: { userId: user.id } }, { guild: { id: ctx.interaction.guildId }, target: { userId: user.id } }]
				: [{ guild: { id: ctx.interaction.guildId } }];
			const transactions = await Infraction.find({ relations: ['target', 'agent', 'guild'], where });
			return transactions.map((infraction) => new ExecutionNode()
				.setName(infraction.type)
				.setValue(`transaction_${infraction.id}`)
				.setType('select')
				.setDescription(`>>> ${Emojis.SKULL}**Target**: <@${infraction.target.userId}>\n${Emojis.DEED} **Agent**: <@${infraction.agent.userId}>`)
				.setOptions(() => [
					...displayInfraction(infraction),
					new ExecutionNode()
						.setName('Delete')
						.setValue('infraction_delete')
						.setType('button')
						.setDescription(`${Emojis.CHECK} Infraction Deleted`)
						.setExecution(async () => { infraction.remove(); }),
				]));
		});
}
