import { Infraction } from '../../entities';
import { displayInfraction } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction')
		.setDescription('View and delete infractions')
		.setModule('MODERATION')
		.setFormat('infraction <view | delete> [...arguments]')
		.setExamples([
			'infraction view 949881277484499065',
			'infraction delete id 949881277484499065',
			'infraction delete user @user',
			'infraction delete all',
		])
		.addSubcommandGroup((subcommandgroup) => subcommandgroup
			.setName('view')
			.setDescription('View infraction data')
			.addSubcommand((subcommand) => subcommand
				.setName('single')
				.setDescription('View a single infraction')
				.addStringOption((option) => option.setName('infraction_id').setDescription('Specify a infraction').setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('user')
				.setDescription('View all infractions for a user')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true)))
			.addSubcommand((subcommand) => subcommand.setName('all').setDescription('View all infractions')))
		.addSubcommandGroup((subcommandgroup) => subcommandgroup
			.setName('delete')
			.setDescription('Delete infraction data')
			.setAuthority('MANAGER')
			.addSubcommand((subcommand) => subcommand
				.setName('single')
				.setDescription('Delete a single infraction')
				.addStringOption((option) => option.setName('infraction_id').setDescription('Specify a infraction').setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('user')
				.setDescription('Delete all infractions for a user')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true)))
			.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all infractions')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const user = ctx.interaction.options.getUser('user', false);
		const id = ctx.interaction.options.getString('infraction_id', false);
		const infraction = await Infraction.findOne({ relations: ['guild', 'target', 'agent'], where: { id, guild: ctx.guildEntity } });
		if (id && !infraction) {
			await ctx.embedify('error', 'user', `Could not find infraction with id \`${id}\``, true);
			return;
		}

		if (subcommandgroup === 'view') {
			if (subcommand === 'single') {
				const embed = await displayInfraction(infraction);
				await ctx.interaction.reply({ embeds: [embed] });
			} else if (subcommand === 'user') {
				const infractions = await Infraction.find({ relations: ['target', 'target.user'], where: { guild: ctx.guildEntity, target: { user: { id: user.id } } } });
				await ctx.embedify('info', 'user', `**${user.tag}'s Infractions:**\n\`${infractions.map((v) => v.id).join('`, `')}\``, false);
			} else if (subcommand === 'all') {
				const infractions = await Infraction.find({ guild: ctx.guildEntity });
				await ctx.embedify('info', 'user', `**All Infractions:**\n\`${infractions.map((v) => v.id).join('`, `')}\``, false);
			}
		} if (subcommandgroup === 'delete') {
			if (subcommand === 'single') {
				await infraction.remove();
				await ctx.embedify('success', 'guild', `Deleted infraction \`${id}\``, true);
			} else if (subcommand === 'user') {
				const infractions = await Infraction.find({ relations: ['guild', 'target', 'target.user'], where: { guild: ctx.guildEntity, target: { user: { id: user.id } } } });
				await Infraction.remove(infractions);
				await ctx.embedify('success', 'guild', `Deleted \`${infractions.length}\` infractions.`, true);
			} else if (subcommand === 'all') {
				const infractions = await Infraction
					.createQueryBuilder('infraction')
					.where('guild = :id', { id: ctx.interaction.guildId })
					.delete()
					.execute();
				await ctx.embedify('success', 'guild', `Deleted \`${infractions.affected}\` infractions.`, true);
			}
		}
	};
}
