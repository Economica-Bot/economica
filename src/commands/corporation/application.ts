import { MessageEmbed } from 'discord.js';
import { validateObjectId, validateSubdocumentObjectId } from '../../lib';
import { Application, Corporation, CorporationModel, OccupationString } from '../../models';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('application')
		.setDescription('Manage your corporation applications.')
		.setModule('CORPORATION');

	public execute = async (ctx: Context): Promise<void> => {
		const applications: Application[] = await CorporationModel.aggregate([
			{ $match: { guild: ctx.guildDocument, member: ctx.memberDocument } },
			{ $project: { applications: 1 } },
		]);
		const description = applications.map((application) => `\`${application._id}\` | ${application.parent().name}`).join('\n');
		const embed = new MessageEmbed()
			.setAuthor({ iconURL: ctx.interaction.user.displayAvatarURL(), name: 'Applications' })
			.setDescription(description);

		const { document: corporationDocument } = await validateObjectId(ctx, 'Corporation');
		const { document: applicationDocument } = await validateSubdocumentObjectId(ctx, 'Application', corporationDocument);
		if (subcommand === 'view') {
			if (applicationDocument) return this.displayApplication(ctx, applicationDocument);
			await corporationDocument
				.populate({ path: 'applications', populate: { path: 'member', model: 'Member' } })
				.execPopulate();
			const content = corporationDocument.applications.map((application) => `<@!${application.member.userId}>\n> *${application.occupation}* | ID: \`${application._id}\``);
			return ctx.embedify('info', { name: `${corporationDocument.name} Applications` }, content.join('\n\n'), false);
		} if (subcommand === 'apply') {
			const occupation = ctx.interaction.options.getString('occupation') as OccupationString;
			const content = ctx.interaction.options.getString('content');
			corporationDocument.applications.push({ member: ctx.memberDocument, occupation, content });
			await corporationDocument.save();
			const application = corporationDocument.applications.find(
				(app) => app.member === ctx.memberDocument,
			);
			return this.displayApplication(ctx, application);
		} if (subcommand === 'withdraw') {
			if (!applicationDocument) {
				return ctx.embedify('error', 'user', 'Could not find that application.', true);
			} if (applicationDocument.member !== ctx.memberDocument) {
				return ctx.embedify('warn', 'user', 'This application does not belong to you.', true);
			} if (!applicationDocument.pending) {
				return ctx.embedify('warn', 'user', 'This application is not pending.', true);
			}
			applicationDocument.accepted = false;
			applicationDocument.pending = false;
			await applicationDocument.save();
			return ctx.embedify('success', 'user', 'Application canceled', false);
		} if (subcommand === 'accept') {
			if (!applicationDocument) {
				return ctx.embedify('error', 'user', 'Could not find that application.', true);
			} if (corporationDocument.owner !== ctx.memberDocument) {
				return ctx.embedify('warn', 'user', 'You do not have permission to accept that application.', true);
			} if (!applicationDocument.pending) {
				return ctx.embedify('warn', 'user', 'This application is not pending.', true);
			}
			applicationDocument.accepted = true;
			applicationDocument.pending = false;
			await applicationDocument.save();
			return ctx.embedify('success', 'user', 'Application accepted.', false);
		} if (subcommand === 'reject') {
			if (!applicationDocument) {
				return ctx.embedify('error', 'user', 'Could not find that application.', true);
			} if (corporationDocument.owner !== ctx.memberDocument) {
				return ctx.embedify('warn', 'user', 'You do not have permission to accept that application.', true);
			} if (!applicationDocument.pending) {
				return ctx.embedify('warn', 'user', 'This application is not pending.', true);
			}
			applicationDocument.accepted = false;
			applicationDocument.pending = false;
			await applicationDocument.save();
			return ctx.embedify('success', 'user', 'Application rejected.', false);
		}
	};

	private async displayApplication(
		ctx: Context,
		application: Application,
	): Promise<void> {
		const corporation = application.parent() as Corporation;
		const embed = ctx
			.embedify('info', { name: 'Application', iconURL: ctx.interaction.user.displayAvatarURL() }, application.content)
			.addField('Corporation', corporation.name, true)
			.addField('Occupation', application.occupation, true)
			.addField('Date', application.createdAt.toLocaleString(), true)
			.setFooter({ text: `${application._id}` });
		return ctx.interaction.reply({ embeds: [embed] });
	}
}
