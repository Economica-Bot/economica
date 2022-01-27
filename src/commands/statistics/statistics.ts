import { Message, MessageEmbed } from 'discord.js';

import { TransactionModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('statistics')
		.setDescription('View statistics')
		.setGroup('statistics')
		.setFormat('<balance> [user]')
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('balance')
				.setDescription('View statistics for user balance.')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(false))
		);

	execute = async (ctx: Context) => {
		const user = ctx.interaction.options.getUser('user');
		const wallets: number[] = [];
		const treasuries: number[] = [];
		const totals: number[] = [];
		const dates: string[] = [];

		if (ctx.interaction.options.getSubcommand() === 'balance') {
			const transactions = user
				? await TransactionModel.find({
						guildId: ctx.interaction.guild.id,
						userId: user.id,
				  })
				: await TransactionModel.find({
						guildId: ctx.interaction.guild.id,
				  });

			transactions.forEach((transaction) => {
				wallets.push(transaction.wallet);
				treasuries.push(transaction.treasury);
				totals.push(transaction.total);
				dates.push(transaction.createdAt.toLocaleDateString());
			});

			const wallets1: number[] = [];
			const treasuries1: number[] = [];
			const totals1: number[] = [];
			const dates1: string[] = [];

			if (dates.length > 250) {
				const r = dates.length / 250;
				for (let i = 0; i < 250; i += r) {
					wallets1.push(wallets[Math.round(i)]);
					treasuries1.push(treasuries[Math.round(i)]);
					totals1.push(totals[Math.round(i)]);
					dates1.push(dates[Math.round(i)]);
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
			const embed: MessageEmbed = await ctx.embedify(
				'info',
				{
					name: 'Balance Statistics',
					iconURL: user?.displayAvatarURL() ?? ctx.interaction.guild.iconURL(),
				},
				null,
				false
			);

			embed.setImage(url);
			await ctx.interaction.reply({ embeds: [embed] });
		}
	};
}
