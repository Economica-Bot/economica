import { isValidObjectId } from 'mongoose';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

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
					option.setName('collection').setDescription('Specify the collection.').setRequired(true)
				)
				.addStringOption((option) => option.setName('_id').setDescription('Specify the id.'))
		)
		.addEconomicaSubcommand((subcommandgroup) =>
			subcommandgroup
				.setName('reload')
				.setDescription('Reload mongoose documents.')
				.addStringOption((option) =>
					option.setName('collection').setDescription('Specify the collection.').setRequired(true)
				)
				.addStringOption((option) => option.setName('_id').setDescription('Specify the id.').setRequired(true))
		);

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const collectionQuery = ctx.interaction.options.getString('collection');
		const _id = ctx.interaction.options.getString('_id', false);
		const collection = (await ctx.client.mongoose.connection.db.collections()).find(
			(collection) => collection.collectionName.toLowerCase() === collectionQuery.toLowerCase()
		);
		if (!collection) {
			return await ctx.embedify('error', 'user', 'Could not find that collection.', true);
		}

		if (subcommand === 'delete') {
			let description;
			if (_id) {
				if (!isValidObjectId(_id)) {
					return await ctx.embedify('error', 'user', 'Invalid object id.', true);
				}

				await collection.deleteOne({ _id }).then(async (res) => {
					description = `Deleted \`${res.deletedCount}\` document.`;
				});
			} else {
				await collection.deleteMany({}).then(async (res) => {
					description = `Deleted \`${res.deletedCount}\` documents.`;
				});
			}

			return ctx.embedify('success', 'user', description, true);
		}
	};
}
