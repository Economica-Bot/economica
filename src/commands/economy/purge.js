const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const economySchema = require('../../util/mongo/schemas/economy-sch');
const marketItemSchema = require('../../util/mongo/schemas/market-item-sch');
const shopItemSchema = require('../../util/mongo/schemas/shop-item-sch');
const inventorySchema = require('../../util/mongo/schemas/inventory-sch');
const transactionSchema = require('../../util/mongo/schemas/transaction-sch');
const infractionSchema = require('../../util/mongo/schemas/infraction-sch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription(commands.commands.purge.description)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('balance')
				.setDescription('Delete balance data.')
				.addSubcommand((subcommand) =>
					subcommand.setName('all').setDescription('Delete all balances.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete user balance.')
						.addUserOption((option) =>
							option
								.setName('user')
								.setDescription('Specify a user.')
								.setRequired(true)
						)
				)
		)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('inventory')
				.setDescription('Delete inventory data.')
				.addSubcommand((subcommand) =>
					subcommand.setName('all').setDescription('Delete all inventories.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete user inventory.')
						.addUserOption((option) =>
							option
								.setName('user')
								.setDescription('Specify a user.')
								.setRequired(true)
						)
				)
		)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('transaction')
				.setDescription('Delete transaction data.')
				.addSubcommand((subcommand) =>
					subcommand.setName('all').setDescription('Delete all transactions.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete user transactions.')
						.addUserOption((option) =>
							option
								.setName('user')
								.setDescription('Specify a user.')
								.setRequired(true)
						)
				)
		)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('infraction')
				.setDescription('Delete infraction data.')
				.addSubcommand((subcommand) =>
					subcommand.setName('all').setDescription('Delete all infractions.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete user infractions.')
						.addUserOption((option) =>
							option
								.setName('user')
								.setDescription('Specify a user.')
								.setRequired(true)
						)
				)
		)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('shop')
				.setDescription('Delete shop data.')
				.addSubcommand((subcommand) =>
					subcommand.setName('all').setDescription('Delete all listings.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('item')
						.setDescription('Delete shop item.')
						.addStringOption((option) =>
							option
								.setName('item')
								.setDescription('Specify an item.')
								.setRequired(true)
						)
				)
		),
	async run(interaction) {
		const guildID = interaction.guild.id;
		const userID = interaction.options.getUser('user')?.id;
		let color = 'GREEN',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '';

		if (interaction.options.getSubcommandGroup() === 'inventory') {
			if (interaction.options.getSubcommand() === 'all') {
				await inventorySchema
					.deleteMany({
						guildID,
					})
					.then((result) => {
						description = `Deleted all inventory data. \`${result.n}\` removed.`;
					});
			} else if (interaction.options.getSubcommand() === 'user') {
				await inventorySchema
					.findOneAndDelete({
						guildID,
						userID,
					})
					.then((result) => {
						description = `Deleted inventory data for <@!${userID}>`;
					});
			}
		} else if (interaction.options.getSubcommandGroup() === 'market') {
			if (interaction.options.getSubcommand() === 'all') {
				await marketItemSchema
					.deleteMany({
						guildID,
					})
					.then((result) => {
						description = `Deleted all market data. \`${result.n}\` removed.`;
					});
			} else if (interaction.options.getSubcommand() === 'user') {
				await marketItemSchema
					.deleteMany({
						guildID,
						userID,
					})
					.then((result) => {
						description = `Deleted market data for <@!${userID}>`;
					});
			}
		} else if (interaction.options.getSubcommandGroup() === 'shop') {
			if (interaction.options.getSubcommand() === 'all') {
				await shopItemSchema
					.deleteMany({
						guildID,
					})
					.then(async (result) => {
						description = `Deleted all shop data. \`${result.n}\` removed.`;
						await inventorySchema.deleteMany({
							guildID,
						});
					});
			} else if (interaction.options.getSubcommand() === 'item') {
				const item = interaction.options.getString('item');
				await shopItemSchema
					.deleteMany({
						guildID,
						name: item,
					})
					.then(async (result) => {
						description = `Deleted \`${item}\` from the shop.`;
						await inventorySchema.updateMany(
							{
								guildID,
							},
							{
								$pull: {
									inventory: {
										name: item,
									},
								},
							}
						);
					});
			}
		} else if (interaction.options.getSubcommandGroup() === 'balance') {
			if (interaction.options.getSubcommand() === 'all') {
				await economySchema
					.deleteMany({
						guildID,
					})
					.then((result) => {
						description = `Deleted all balance data. \`${result.n}\` removed.`;
					});
			} else if (interaction.options.getSubcommand() === 'user') {
				await economySchema
					.deleteMany({
						guildID,
						userID,
					})
					.then((result) => {
						description = `Deleted balance data for <@!${userID}>`;
					});
			}
		} else if (interaction.options.getSubCommandGroup() === 'transaction') {
			if (interaction.options.getSubcommand() === 'all') {
				await transactionSchema
					.deleteMany({
						guildID,
					})
					.then((result) => {
						description = `Deleted all transaction data. \`${result.n}\` removed.`;
					});
			} else if (interaction.options.getSubcommand() === 'user') {
				await transactionSchema
					.deleteMany({ guildID, userID })
					.then((result) => {
						description = `Deleted transaction data for <@!${userID}>. \`${result.n}\` removed.`;
					});
			}
		} else if (interaction.options.getSubCommandGroup() === 'infraction') {
			if (interaction.options.getSubcommand() === 'all') {
				await infractionSchema
					.deleteMany({ guilddID })
					.then(
						(result) =>
							(description = `Deleted all infraction data. \`${result.n}\` removed.`)
					);
			} else if (interaction.options.getSubcommand() === 'user') {
				await infractionSchema
					.deleteMany({ guildID, userID })
					.then((result) => {
						description = `Deleted infraction data for <@!${userID}>. \`${result.n}\` removed.`;
					});
			}
		}

		await interaction.reply({
			embeds: [util.embedify(color, title, icon_url, description)],
		});
	},
};
