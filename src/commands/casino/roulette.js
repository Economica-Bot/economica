const bet = {
	name: 'bet',
	description: 'Specify a bet.',
	type: 'STRING',
	required: true,
};

const number_one = {
	name: 'number_one',
	description: 'Specify the first number.',
	type: 'INTEGER',
	required: true,
	min_value: 0,
	max_value: 36,
};

const number_two = {
	name: 'number_two',
	description: 'Specify the second number.',
	type: 'INTEGER',
	required: true,
	min_value: 0,
	max_value: 36,
};

const number_three = {
	name: 'number_three',
	description: 'Specify the third number.',
	type: 'INTEGER',
	required: true,
	min_value: 0,
	max_value: 36,
};

const number_four = {
	name: 'number_four',
	description: 'Specify the fourth number.',
	type: 'INTEGER',
	required: true,
	min_value: 0,
	max_value: 36,
};

const number_five = {
	name: 'number_five',
	description: 'Specify the fifth number.',
	type: 'INTEGER',
	required: true,
	min_value: 0,
	max_value: 36,
};

const number_six = {
	name: 'number_six',
	description: 'Specify the sixth number.',
	type: 'INTEGER',
	required: true,
	min_value: 0,
	max_value: 36,
};

module.exports = {
	name: 'roulette',
	description: 'Play roulette.',
	group: 'casino',
	global: true,
	options: [
		{
			name: 'inside',
			description: 'Inside Bets',
			type: 'SUB_COMMAND_GROUP',
			options: [
				{
					name: 'single',
					description: 'Bet on a single number.',
					type: 'SUB_COMMAND',
					options: [number_one, bet],
				},
				{
					name: 'split',
					description:
						'Bet on two distinct vertically/horizontally adjacent numbers.',
					type: 'SUB_COMMAND',
					options: [number_one, number_two, bet],
				},
				{
					name: 'street',
					description:
						'Bet on three distinct consecutive numbers in a horizontal line.',
					type: 'SUB_COMMAND',
					options: [number_one, number_two, number_three, bet],
				},
				{
					name: 'corner',
					description: 'Bet on four numbers that meet at one corner.',
					type: 'SUB_COMMAND',
					options: [number_one, number_two, number_three, number_four, bet],
				},
				{
					name: 'double_street',
					description:
						'Bet on six consecutive numbers that form two horizontal lines.',
					type: 'SUB_COMMAND',
					options: [
						number_one,
						number_two,
						number_three,
						number_four,
						number_five,
						number_six,
						bet,
					],
				},
				{
					name: 'trio',
					description: 'A three-number bet that involves at least one zero.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'choice',
							description: 'Choose triangle.',
							type: 'STRING',
							required: true,
							choices: [
								{
									name: '0-1-2',
									value: '0-1-2',
								},
								{
									name: '0-2-3',
									value: '0-2-3',
								},
							],
						},
						bet,
					],
				},
				{
					name: 'first_four',
					description: 'Bet on 0-1-2-3.',
					type: 'SUB_COMMAND',
					options: [bet],
				},
			],
		},
		{
			name: 'outside',
			description: 'Outside Bets',
			type: 'SUB_COMMAND_GROUP',
			options: [
				{
					name: 'half',
					description: 'A bet that the number will be in the chosen range.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'choice',
							description: 'Choose High or Low',
							type: 'STRING',
							required: true,
							choices: [
								{
									name: 'low',
									value: 'low',
								},
								{
									name: 'high',
									value: 'high',
								},
							],
						},
						bet,
					],
				},
				{
					name: 'color',
					description: 'A bet that the number will be the chosen color.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'choice',
							description: 'Choose Red or Black',
							type: 'STRING',
							required: true,
							choices: [
								{
									name: 'red',
									value: 'red',
								},
								{
									name: 'black',
									value: 'black',
								},
							],
						},
						bet,
					],
				},
				{
					name: 'even_or_odd',
					description: 'A bet that the number will be of the chosen type.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'choice',
							description: 'Choose Even or Odd',
							type: 'STRING',
							required: true,
							choices: [
								{
									name: 'Even',
									value: 'even',
								},
								{
									name: 'Odd',
									value: 'odd',
								},
							],
						},
						bet,
					],
				},
				{
					name: 'dozen',
					description: 'A bet that the number will be in the chosen dozen.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'choice',
							description: 'Choose a dozen',
							type: 'STRING',
							required: true,
							choices: [
								{
									name: 'First Dozen',
									value: 'first',
								},
								{
									name: 'Second Dozen',
									value: 'second',
								},
								{
									name: 'Third Dozen',
									value: 'third',
								},
							],
						},
						bet,
					],
				},
				{
					name: 'column',
					description:
						'A bet that the number will be in the chosen vertical column.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'choice',
							description: 'Choose a column',
							type: 'STRING',
							required: true,
							choices: [
								{
									name: 'First Column',
									value: 'first',
								},
								{
									name: 'Second Column',
									value: 'second',
								},
								{
									name: 'Third Column',
									value: 'third',
								},
							],
						},
						bet,
					],
				},
				{
					name: 'snake',
					description:
						'A special bet that covers the numbers 1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, and 34.',
					type: 'SUB_COMMAND',
					options: [bet],
				},
			],
		},
	], //https://crescent.edu/post/the-basic-rules-of-roulette
	async run(interaction) {
		let color = 'GREEN',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '',
			bet =
				interaction.options.getString('bet') === 'all'
					? wallet
					: parseInt(interaction.options.getString('bet'));
		const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
		const { wallet } = await util.getEconInfo(
			interaction.guild.id,
			interaction.member.user.id
		);
		const ballPocket =
			interaction.options.getSubcommand() === 'inside'
				? Math.floor(Math.random() * 36 + 1)
				: Math.floor(Math.random() * 37 + 1);
		const nums = [];
		for (const option of interaction.options._hoistedOptions) {
			if (
				[
					'number_one',
					'number_two',
					'number_three',
					'number_four',
					'number_five',
					'number_six',
				].includes(option.name)
			) {
				nums.push(option.value);
			}

			if (option.name === 'bet') {
				if (bet < 0 || bet > wallet || !bet) {
					color = 'RED';
					description = `Invalid bet: ${cSymbol}${bet.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
				} else {
					bet = option.value;
				}
			}
		}

		if (description.length) {
			interaction.reply({
				embeds: [util.embedify(color, title, icon_url, description)],
			});
			return;
		}

		description += `The ball landed on \`${ballPocket}\`\n`;

		if (interaction.options.getSubcommand() === 'single') {
			if (nums[0] === ballPocket) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (interaction.options.getSubcommand() === 'split') {
			if (
				nums[0] != nums[1] &&
				(Math.abs(nums[0] - nums[1]) === 1 || Math.abs(nums[0] - nums[1]) === 3)
			) {
				if (nums[0] === ballPocket || nums[1] === ballPocket) {
					bet *= 4;
					description += `You won ${cSymbol}${bet.toLocaleString()}`;
				} else {
					color = 'RED';
					description += `You lost ${cSymbol}${bet.toLocaleString()}`;
					bet *= -1;
				}
			} else {
				color = 'RED';
				description = `Incorrect format.\n\`${this.options[0].options[1].description}\``;
			}
		} else if (interaction.options.getSubcommand() === 'street') {
			if (
				nums[0] % 3 === 1 &&
				nums[0] != nums[1] &&
				nums[1] != nums[2] &&
				nums[0] != nums[2] &&
				Math.abs(nums[0] - nums[1]) === 1 &&
				Math.abs(nums[2] - nums[1]) === 1
			) {
				if (
					nums[0] === ballPocket ||
					nums[1] === ballPocket ||
					nums[2] === ballPocket
				) {
					bet *= 4;
					description += `You won ${cSymbol}${bet.toLocaleString()}`;
				} else {
					color = 'RED';
					description += `You lost ${cSymbol}${bet.toLocaleString()}`;
					bet *= -1;
				}
			} else {
				color = 'RED';
				description = `Incorrect format.\n\`${this.options[0].options[2].description}\``;
			}
		} else if (interaction.options.getSubcommand() === 'corner') {
			if (
				nums[1] - nums[0] === 1 &&
				nums[3] - nums[2] === 1 &&
				nums[2] - nums[1] === 2
			) {
				if (
					nums[0] === ballPocket ||
					nums[1] === ballPocket ||
					nums[2] === ballPocket ||
					nums[3] === ballPocket
				) {
					bet *= 4;
					description += `You won ${cSymbol}${bet.toLocaleString()}`;
				} else {
					color = 'RED';
					description += `You lost ${cSymbol}${bet.toLocaleString()}`;
					bet *= -1;
				}
			} else {
				color = 'RED';
				description = `Incorrect format.\n\`${this.options[0].options[3].description}\``;
			}
		} else if (interaction.options.getSubcommand() === 'double_street') {
			if (
				nums[0] % 3 === 1 &&
				nums[0] + 1 === nums[1] &&
				nums[1] + 1 === nums[2] &&
				nums[2] + 1 === nums[3] &&
				nums[3] + 1 === nums[4] &&
				nums[4] + 1 === nums[5]
			) {
				if (
					nums[0] === ballPocket ||
					nums[1] === ballPocket ||
					nums[2] === ballPocket ||
					nums[3] === ballPocket ||
					nums[4] === ballPocket ||
					nums[5] === ballPocket
				) {
					bet *= 4;
					description += `You won ${cSymbol}${bet.toLocaleString()}`;
				} else {
					color = 'RED';
					description += `You lost ${cSymbol}${bet.toLocaleString()}`;
					bet *= -1;
				}
			} else {
				color = 'RED';
				description = `Incorrect format.\n\`${this.options[0].options[4].description}\``;
			}
		} else if (interaction.options.getSubcommand() === 'trio') {
			if (interaction.options.getString('choice') === '0-1-2') {
				nums[0] = 0;
				nums[1] = 1;
				nums[2] = 2;
			} else {
				nums[0] = 0;
				nums[1] = 2;
				nums[2] = 3;
			}
			if (
				nums[0] === ballPocket ||
				nums[1] === ballPocket ||
				nums[2] === ballPocket
			) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (interaction.options.getSubcommand() === 'first_four') {
			if (ballPocket >= 0 && ballPocket <= 3) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (interaction.options.getSubcommand() === 'half') {
			if (
				(interaction.options.getString('choice') === 'low' &&
					ballPocket <= 18) ||
				ballPocket > 18
			) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (options._subcommand === 'color') {
			if (
				(interaction.options.getString('choice') === 'red' &&
					ballPocket % 2 === 0) ||
				ballPocket % 2 === 1
			) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (interaction.options.getSubcommand() === 'even_or_odd') {
			if (
				(interaction.options.getString('choice') === 'even' &&
					ballPocket % 2 === 0) ||
				ballPocket % 2 === 1
			) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (interaction.options.getSubcommand() === 'dozen') {
			if (
				(interaction.options.getString('choice') === 'first' &&
					ballPocket <= 12) ||
				(interaction.options.getString('choice') === 'second' &&
					ballPocket > 12 &&
					ballPocket <= 24) ||
				(interaction.options.getString('choice') === 'third' &&
					ballPocket > 25 &&
					ballPocket <= 36)
			) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (interaction.options.getSubcommand() === 'column') {
			if (
				(interaction.options.getString('choice') === 'first' &&
					ballPocket % 3 === 1) ||
				(interaction.options.getString('choice') === 'second' &&
					ballPocket % 3 === 2) ||
				(interaction.options.getString('choice') === 'third' &&
					ballPocket % 3 === 0)
			) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		} else if (interaction.options.getSubcommand() === 'snake') {
			if ([1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, 34].includes(ballPocket)) {
				bet *= 4;
				description += `You won ${cSymbol}${bet.toLocaleString()}`;
			} else {
				color = 'RED';
				description += `You lost ${cSymbol}${bet.toLocaleString()}`;
				bet *= -1;
			}
		}

		if (!description.includes('format')) {
			await util.transaction(
				interaction.guild.id,
				interaction.member.id,
				this.name,
				description,
				bet,
				0,
				bet
			);
		}

		await interaction.reply({
			embeds: [util.embedify(color, title, icon_url, description)],
		});
	},
};
