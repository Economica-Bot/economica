import { EconomicaCommand, EconomicaSlashCommandBuilder, Context } from "../../structures"

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('set-refund')
		.setDescription('Set the proportion of item cost that will be refunded on sell.')
		.setModule('SHOP')
		.addNumberOption((options) =>
			options
				.setName('proportion')
				.setDescription('A decimal ranging from 0 to 1.0')
				.setRequired(true)
		)
	public execute = async (ctx: Context): Promise<void> => {
		const proportion = ctx.interaction.options.getNumber('proportion')

		if (proportion < 0 || proportion > 1)
			return await ctx.embedify('error', 'user', '`proportion` must be between 0 and 1!', true)

		await ctx.embedify('success', 'user', `Refund proportion for selling items has been set to \`${proportion.toFixed(4)}\`. Users will now be refunded ${(proportion * 100).toFixed(2)}% of an item's price on \`/sell\``, false)

		ctx.guildDocument.sellRefund = proportion
		await ctx.guildDocument.save()
	}
}