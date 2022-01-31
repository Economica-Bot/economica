import { Message } from 'discord.js';
import { isValidObjectId } from 'mongoose';

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

type Documents = 'guilds' | 'infractions' | 'loans' | 'markets' | 'members' | 'shops' | 'transactions';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('mongo')
		.setDescription('Manipulate database.')
		.setGroup('APPLICATION')
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
		);

	execute = async (ctx: Context): Promise<Message> => {
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
		}
	};
}
