import { Message } from 'discord.js';
import ms from 'ms';

import { validateSubdocumentObjectId } from '../../lib';
import { Member, MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction')
		.setDescription('View and delete infractions.')
		.setModule('ECONOMY')
		.setFormat('(view <infraction_id> | delete <id | user | all> [infraction_id | user])')
		.setExamples([
			'infraction view 615a88b83f908631d40632c1',
			'infraction delete id 615a88b83f908631d40632c1',
			'infraction delete user @Wumpus',
			'infraction delete all',
		])
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View a infraction.')
				.addStringOption((option) =>
					option.setName('infraction_id').setDescription('Specify a infraction.').setRequired(true)
				)
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('delete')
				.setDescription('Delete infraction data.')
				.setAuthority('MANAGER')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('id')
						.setDescription('Delete a single infraction.')
						.addStringOption((option) =>
							option.setName('infraction_id').setDescription('Specify a infraction.').setRequired(true)
						)
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete all infractions for a user.')
						.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(true))
				)
				.addEconomicaSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all infractions.'))
		);

	public execute = async (ctx: Context): Promise<void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const user = ctx.interaction.options.getUser('user', false);
		const { valid, document } = await validateSubdocumentObjectId(ctx, 'Infraction', ctx.memberDocument);
		if (!valid) {
			return;
		} else if (subcommand === 'view') {
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

			return await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				document.deleteOne();
			} else if (subcommand === 'user') {
				const memberDocument = document.parent() as Member;
				memberDocument.infractions.length = 0;
				await memberDocument.save();
			} else if (subcommand === 'all') {
				await MemberModel.updateMany({ guild: ctx.guildDocument }, { $set: { infractions: [] } });
			}

			return await ctx.embedify('success', 'user', 'Infraction(s) removed.', true);
		}
	};
}
