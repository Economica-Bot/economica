import { Message } from 'discord.js';
import { isValidObjectId } from 'mongoose';

import * as guildCreate from '../../events/guildCreate';
import {
	GuildModel,
	InfractionModel,
	LoanModel,
	MarketModel,
	MemberModel,
	ShopModel,
	TransactionModel,
} from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { Documents } from '../../typings';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('mongo')
		.setDescription('Manipulate database.')
		.setModule('APPLICATION')
		.setAuthority('DEVELOPER')
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete mongoose documents.')
				.addStringOption((option) =>
					option
						.setName('collection')
						.setDescription('Specify the collection.')
						.addChoices([
							['guilds', 'guilds'],
							['infractions', 'infractions'],
							['loans', 'loans'],
							['markets', 'markets'],
							['members', 'members'],
							['shops', 'shops'],
							['transactions', 'transactions'],
						])
						.setRequired(true)
				)
				.addStringOption((option) => option.setName('_id').setDescription('Specify the id.'))
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('reload')
				.setDescription('Reload mongoose documents.')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('guild')
						.setDescription('Reload guild document.')
						.addStringOption((option) => option.setName('id').setDescription('Specify the guild id.'))
				)
		);

	public execute = async (ctx: Context): Promise<Message> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();

		if (subcommand === 'delete') {
			const collection = ctx.interaction.options.getString('collection') as Documents;
			const _id = ctx.interaction.options.getString('_id', false);

			let description;

			if (_id) {
				if (!isValidObjectId(_id)) {
					return await ctx.embedify('error', 'user', 'Invalid object id.', true);
				}

				switch (collection) {
					case 'guilds':
						await GuildModel.deleteOne({ _id }).then(async (res) => {
							description = `Deleted transaction \`${_id}\`.`;
						});
						break;
					case 'infractions':
						await InfractionModel.deleteOne({ _id }).then(async (res) => {
							description = `Deleted transaction \`${_id}\`.`;
						});
						break;
					case 'loans':
						await LoanModel.deleteOne({ _id }).then(async (res) => {
							description = `Deleted transaction \`${_id}\`.`;
						});
						break;
					case 'markets':
						await MarketModel.deleteOne({ _id }).then(async (res) => {
							description = `Deleted transaction \`${_id}\`.`;
						});
						break;
					case 'members':
						await MemberModel.deleteOne({ _id }).then(async (res) => {
							description = `Deleted transaction \`${_id}\`.`;
						});
						break;
					case 'shops':
						await ShopModel.deleteOne({ _id }).then(async (res) => {
							description = `Deleted transaction \`${_id}\`.`;
						});
						break;
					case 'transactions':
						await TransactionModel.deleteOne({ _id }).then(async (res) => {
							description = `Deleted transaction \`${_id}\`.`;
						});
						break;
					default:
						break;
				}
			} else {
				switch (collection) {
					case 'guilds':
						await GuildModel.deleteMany().then(async (res) => {
							description = `Deleted \`${res.deletedCount}\` documents.`;
						});
						break;
					case 'infractions':
						await InfractionModel.deleteMany().then(async (res) => {
							description = `Deleted \`${res.deletedCount}\` documents.`;
						});
						break;
					case 'loans':
						await LoanModel.deleteMany().then(async (res) => {
							description = `Deleted \`${res.deletedCount}\` documents.`;
						});
						break;
					case 'markets':
						await MarketModel.deleteMany().then(async (res) => {
							description = `Deleted \`${res.deletedCount}\` documents.`;
						});
						break;
					case 'members':
						await MemberModel.deleteMany().then(async (res) => {
							description = `Deleted \`${res.deletedCount}\` documents.`;
						});
						break;
					case 'shops':
						await ShopModel.deleteMany().then(async (res) => {
							description = `Deleted \`${res.deletedCount}\` documents.`;
						});
						break;
					case 'transactions':
						await TransactionModel.deleteMany().then(async (res) => {
							description = `Deleted \`${res.deletedCount}\` documents.`;
						});
						break;
				}
			}

			return ctx.embedify('success', 'user', description, true);
		} else if (subcommandgroup === 'reload') {
			if (subcommand === 'guild') {
				let guild = ctx.interaction.guild;
				const guildId = ctx.interaction.options.getString('id', false);
				if (guildId) {
					guild = ctx.client.guilds.cache.get(guildId);
					if (!guild) {
						return await ctx.embedify('error', 'user', 'Invalid guild id.', true);
					}
				}

				await new guildCreate.default().execute(ctx.client, guild);
				return await ctx.embedify('success', 'user', `Reset guild doc in \`${guild}\`.`, true);
			}
		}
	};
}
