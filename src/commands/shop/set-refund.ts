import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('set-refund')
		.setDescription("Set the proportion of the item's original cost that will be refunded upon selling")
		.setModule('SHOP')
		.setFormat('set-refund <proportion>')
		.setExamples(['set-refund 0.5'])
		.addNumberOption((options) => options.setName('proportion').setDescription('A decimal ranging from 0 to 1.0').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const proportion = ctx.interaction.options.getNumber('proportion');
		if (proportion < 0 || proportion > 1) { return ctx.embedify('error', 'user', '`proportion` must be between 0 and 1!', true); }
		ctx.guildDocument.sellRefund = proportion;
		await ctx.guildDocument.save();
		return ctx.embedify('success', 'user', `Refund proportion for selling items has been set to \`${proportion.toFixed(4)}\`. Users will now be refunded ${(proportion * 100).toFixed(2)}% of an item's price on \`/sell\``, false);
	};
}
