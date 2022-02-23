import ms from 'ms';

import { validateSubdocumentObjectId } from '../../lib/index.js';
import { Member, MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction')
		.setDescription('Manage infractions')
		.setModule('MODERATION')
		.setFormat('infraction <view | delete> [...arguments]')
		.setExamples([
			'infraction view 615a88b83f908631d40632c1',
			'infraction delete id 615a88b83f908631d40632c1',
			'infraction delete user @Wumpus',
			'infraction delete all',
		])
		.addSubcommand((subcommand) => subcommand
			.setName('view')
			.setDescription('View a infraction.')
			.addStringOption((option) => option.setName('infraction_id').setDescription('Specify a infraction.').setRequired(true)))
		.addSubcommandGroup((subcommandgroup) => subcommandgroup
			.setName('delete')
			.setDescription('Delete infraction data.')
			.setAuthority('MANAGER')
			.addSubcommand((subcommand) => subcommand
				.setName('id')
				.setDescription('Delete a single infraction.')
				.addStringOption((option) => option.setName('infraction_id').setDescription('Specify a infraction.').setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('user')
				.setDescription('Delete all infractions for a user.')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(true)))
			.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all infractions.')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const { valid, document } = await validateSubdocumentObjectId(ctx, 'Infraction', ctx.memberDocument);
		if (!valid) return;
		if (subcommand === 'view') {
			const member = document.parent() as Member;
			const embed = ctx
				.embedify('info', 'guild', `Infraction for <@!${member.userId}>\nType: \`${document.type}\``)
				.addFields([
					{
						name: '__**Reason**__',
						value: document.reason,
						inline: true,
					},
					{
						name: '__**Details**__',
						// prettier-ignore
						value:
							`Permanent: \`${document.permanent}\` 
							Active: \`${document.active}\` 
							${document.duration
		? `Duration: \`${ms(document.duration)}\``
		: ''
}`,
						inline: true,
					},
				])
				.setTimestamp(document.createdAt);

			ctx.interaction.reply({ embeds: [embed] });
		} if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				document.deleteOne();
			} else if (subcommand === 'user') {
				const memberDocument = document.parent() as Member;
				memberDocument.infractions.length = 0;
				await memberDocument.save();
			} else if (subcommand === 'all') {
				await MemberModel.updateMany({ guild: ctx.guildDocument }, { $set: { infractions: [] } });
			}

			ctx.embedify('success', 'user', 'Infraction(s) removed.', true);
		}
	};
}
