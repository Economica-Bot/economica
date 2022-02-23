import mongoose from 'mongoose';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('mongo')
		.setDescription('Manipulate database.')
		.setModule('APPLICATION')
		.setAuthority('DEVELOPER')
		.addSubcommand((subcommand) => subcommand
			.setName('delete')
			.setDescription('Delete mongoose documents.')
			.addStringOption((option) => option.setName('collection').setDescription('Specify the collection.').setRequired(true))
			.addStringOption((option) => option.setName('_id').setDescription('Specify the id.')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const collectionQuery = ctx.interaction.options.getString('collection');
		const collection = ctx.client.mongoose.connection.collections[collectionQuery];
		const id = ctx.interaction.options.getString('id', false);
		if (!collection) {
			await ctx.embedify('error', 'user', 'Could not find that collection.', true);
		} else if (subcommand === 'delete') {
			if (!id) {
				await collection.deleteMany({}).then(async (res) => {
					await ctx.embedify('success', 'user', `Deleted \`${res.deletedCount}\` document(s).`, true);
				});
			} else if (!mongoose.isValidObjectId(id)) {
				await ctx.embedify('error', 'user', 'Invalid object id.', true);
			} else {
				await collection.deleteOne({ id }).then(async (res) => {
					await ctx.embedify('success', 'user', `Deleted \`${res.deletedCount}\` document(s).`, true);
				});
			}
		}
	};
}
