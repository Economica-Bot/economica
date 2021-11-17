const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rob')
		.setDescription(commands.commands.rob.description)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.').setRequired(true)
		),
	async run(interaction) {
		const user = interaction.options.getUser('user');
		const guildID = interaction.guild.id;
		const userID = interaction.member.id;
		const properties = await util.getIncomeCommandStats(
			guildID,
			this.data.name
		);
		let color, description, amount;
		const { minfine, maxfine } = properties;
		const { wallet } = await util.getEconInfo(guildID, user.id);
		const cSymbol = await util.getCurrencySymbol(guildID);
		if (wallet < 1) {
			(color = 'RED'),
				(description = `<@!${user.id}>\nInsufficient wallet: ${cSymbol}${wallet}`);
		} else {
			if (util.isSuccess(properties)) {
				amount = util.intInRange(0, wallet);
				(color = 'GREEN'),
					(description = `You robbed <@!${
						user.id
					}> for a grand total of ${cSymbol}${amount.toLocaleString()}!`);
				await util.transaction(
					guildID,
					user.id,
					this.data.name,
					`Robbed by <@!${interaction.member.id}>`,
					-amount,
					0,
					-amount
				);
			} else {
				amount = util.intInRange(minfine, maxfine);
				color = 'RED';
				description = `You were caught robbing and fined ${cSymbol}${amount.toLocaleString()}`;
				amount *= -1;
			}

			await util.transaction(
				guildID,
				userID,
				this.data.name,
				`Attempted to rob <@!${user.id}>`,
				amount,
				0,
				amount
			);
		}

		await interaction.reply({
			embeds: [
				util.embedify(
					color,
					interaction.member.user.tag,
					interaction.member.user.displayAvatarURL(),
					description
				),
			],
		});
	},
};
