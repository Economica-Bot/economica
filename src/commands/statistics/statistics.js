const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const transactionSchema = require('../../util/mongo/schemas/transaction-sch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('statistics')
		.setDescription(commands.commands.statistics.description)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('balance')
				.setDescription('Statistics for balance.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Statistics for user balance')
						.addUserOption((option) =>
							option
								.setName('user')
								.setDescription('Specify a user.')
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('total')
						.setDescription('Statistics for all balances')
				)
		),
	async run(interaction) {
		let wallet = 0,
			treasury = 0,
			total = 0,
			transactions = [];
		const wallets = [],
			treasuries = [],
			totals = [],
			dates = [];

		//Init
		wallets.push(wallet);
		treasuries.push(treasury);
		totals.push(total);

		if (interaction.options.getSubcommandGroup() === 'balance') {
			if (interaction.options.getSubcommand() === 'user') {
				const user =
					interaction.options.getUser('user') ?? interaction.member.user;
				transactions = await transactionSchema.find({
					guildID: interaction.guild.id,
					userID: user.id,
				});
				for (const transaction of transactions) {
					wallet += transaction.wallet;
					treasury += transaction.treasury;
					total += transaction.total;
					wallets.push(wallet);
					treasuries.push(treasury);
					totals.push(total);
					dates.push(transaction.createdAt.toLocaleDateString());
				}

				//Current vals
				wallets.push(wallet);
				treasuries.push(treasury);
				totals.push(total);
				dates.push(new Date().toLocaleDateString());
			} else if (interaction.options.getSubcommand() === 'total') {
				transactions = await transactionSchema.find({
					guildID: interaction.guild.id,
				});
				for (const transaction of transactions) {
					wallet += transaction.wallet;
					treasury += transaction.treasury;
					total += transaction.total;
					wallets.push(wallet);
					treasuries.push(treasury);
					totals.push(total);
					dates.push(transaction.createdAt.toLocaleDateString());
				}

				wallets.push(wallet);
				treasuries.push(treasury);
				totals.push(total);
				dates.push(new Date().toLocaleDateString());
			}
		}

		dates1 = [];
		if (dates.length > 250) {
			const r = dates.length / 250;
			for (let i = 0; i < 250; i += r) {
				dates1.push(dates[Math.round(i)]);
			}
		}

		wallets1 = [];
		if (wallets.length > 250) {
			const r = wallets.length / 250;
			for (let i = 0; i < 250; i += r) {
				wallets1.push(wallets[Math.round(i)]);
			}
		}

		treasuries1 = [];
		if (treasuries.length > 250) {
			const r = treasuries.length / 250;
			for (let i = 0; i < 250; i += r) {
				treasuries1.push(treasuries[Math.round(i)]);
			}
		}

		totals1 = [];
		if (totals.length > 250) {
			const r = totals.length / 250;
			for (let i = 0; i < 250; i += r) {
				totals1.push(totals[Math.round(i)]);
			}
		}

		const data = {
			labels: dates1.length ? dates1 : dates,
			datasets: [
				{
					label: 'Wallet',
					data: wallets1.length ? wallets1 : wallets,
					borderColor: 'rgb(255, 99, 132)',
					//backgroundColor: 'rgba(255, 99, 132, .5)',
					backgroundColor: 'transparent',
					borderWidth: '3',
					tension: 0,
					pointRadius: 0,
				},
				{
					label: 'Treasury',
					data: treasuries1.length ? treasuries1 : treasuries,
					borderColor: 'rgb(54, 162, 235)',
					//backgroundColor: 'rgba(54, 162, 235, .5)',
					backgroundColor: 'transparent',
					borderWidth: '3',
					tension: 0,
					pointRadius: 0,
				},
				{
					label: 'Total',
					data: totals1.length ? totals1 : totals,
					borderColor: 'rgb(255, 205, 86)',
					//backgroundColor: 'rgba(255, 205, 86, .5)',
					backgroundColor: 'transparent',
					borderWidth: '3',
					tension: 0,
					pointRadius: 0,
				},
			],
		};

		const opt = {
			title: {
				display: true,
				text: 'Balance',
				fontSize: 20,
				fontColor: 'white',
			},
			legend: {
				labels: {
					fontSize: 16,
					fontColor: 'white',
				},
			},
			scales: {
				xAxes: [
					{
						ticks: {
							fontSize: 14,
							fontColor: 'white',
							maxRotation: 0,
							minRotation: 0,
							maxTicksLimit: 5,
						},
						scaleLabel: {
							display: true,
							labelString: 'Date',
							fontSize: 14,
							fontColor: 'white',
						},
						gridLines: {
							display: false,
						},
					},
				],
				yAxes: [
					{
						ticks: {
							fontSize: 14,
							fontColor: 'white',
						},
						scaleLabel: {
							display: true,
							labelString: 'Balance',
							fontSize: 16,
							fontColor: 'white',
						},
						gridLines: {
							display: false,
						},
					},
				],
			},
		};

		const QuickChart = require('quickchart-js');

		const chart = new QuickChart()
			.setConfig({
				type: 'line',
				data,
				options: opt,
			})
			.setWidth(600)
			.setHeight(450)
			.setBackgroundColor('#2f3136');

		const url = await chart.getShortUrl();
		const embed = util
			.embedify(
				'GOLD',
				'Balance Statistics',
				interaction.options.getSubcommand() === 'total'
					? interaction.guild.iconURL()
					: interaction.options.getUser('user')?.displayAvatarURL() ??
							interaction.member.user.displayAvatarURL(),
				`Total transactions: \`${transactions.length}\``
			)
			.setImage(url)
			.setFooter(url);

		await interaction.reply({ embeds: [embed] });
	},
};
