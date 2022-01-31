import { Message } from 'discord.js';
import ms from 'ms';

import { validateObjectId } from '../../lib/validate';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('infraction')
		.setDescription('View and delete infractions.')
		.setGroup('ECONOMY')
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

	execute = async (ctx: Context): Promise<Message | void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const user = ctx.interaction.options.getUser('user', false);
		const { valid, document, model } = await validateObjectId(ctx, 'infraction');
		if (!valid) return;

		if (subcommand === 'view') {
			const embed = ctx
				.embedify('info', 'guild', `Infraction for <@!${document.userId}>\nType: \`${document.type}\``)
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
				return await ctx.embedify('success', 'guild', `Deleted infraction \`${document._id}\``, true);
			} else if (subcommand === 'user') {
				const infractions = await model.deleteMany({
					guildId: ctx.interaction.guildId,
					userId: user.id,
				});
				return await ctx.embedify('success', 'guild', `Deleted \`${infractions.deletedCount}\` infractions.`, true);
			} else if (subcommand === 'all') {
				const infractions = await model.deleteMany({
					guildId: ctx.interaction.guildId,
				});
				return await ctx.embedify('success', 'guild', `Deleted \`${infractions.deletedCount}\` infractions.`, true);
			}
		}
	};
}
