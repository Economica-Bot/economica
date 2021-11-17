const {
	SlashCommandBuilder,
	SlashCommandIntegerOption,
} = require('@discordjs/builders');
const commands = require('../../config/commands');

const bet = new SlashCommandIntegerOption()
	.setName('bet')
	.setDescription('Provide a bet.')
	.setRequired(true);
const number_one = new SlashCommandIntegerOption()
	.setName('number_one')
	.setDescription('Specify the first number.')
	.setRequired(true);
const number_two = new SlashCommandIntegerOption()
	.setName('number_two')
	.setDescription('Specify the second number.')
	.setRequired(true);
const number_three = new SlashCommandIntegerOption()
	.setName('number_three')
	.setDescription('Specify the third number.')
	.setRequired(true);
const number_four = new SlashCommandIntegerOption()
	.setName('number_four')
	.setDescription('Specify the fourth number.')
	.setRequired(true);
const number_five = new SlashCommandIntegerOption()
	.setName('number_five')
	.setDescription('Specify the fifth number.')
	.setRequired(true);
const number_six = new SlashCommandIntegerOption()
	.setName('number_six')
	.setDescription('Specify the sixth number.')
	.setRequired(true);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roulette')
		.setDescription(commands.commands.roulette.description)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('inside')
				.setDescription('Place an inside bet.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('single')
						.setDescription('Bet on a single number.')
						.addIntegerOption(number_one)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('split')
						.setDescription(
							'Bet on two distinct vertically/horizontally adjacent numbers.'
						)
						.addIntegerOption(number_one)
						.addIntegerOption(number_two)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('street')
						.setDescription(
							'Bet on three distinct consecutive numbers in a horizontal line.'
						)
						.addIntegerOption(number_one)
						.addIntegerOption(number_two)
						.addIntegerOption(number_three)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('street')
						.setDescription(
							'Bet on three distinct consecutive numbers in a horizontal line.'
						)
						.addIntegerOption(number_one)
						.addIntegerOption(number_two)
						.addIntegerOption(number_three)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('corner')
						.setDescription('Bet on four numbers that meet at one corner.')
						.addIntegerOption(number_one)
						.addIntegerOption(number_two)
						.addIntegerOption(number_three)
						.addIntegerOption(number_four)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('double_street')
						.setDescription(
							'Bet on six consecutive numbers that form two horizontal lines.'
						)
						.addIntegerOption(number_one)
						.addIntegerOption(number_two)
						.addIntegerOption(number_three)
						.addIntegerOption(number_four)
						.addIntegerOption(number_five)
						.addIntegerOption(number_six)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('trio')
						.setDescription(
							'A three-number bet that involves at least one zero.'
						)
						.addStringOption((option) =>
							option
								.setName('choice')
								.setDescription('Pick a choice.')
								.addChoices([
									['0-1-2', '0-1-2'],
									['0-2-3', '0-2-3'],
								])
								.setRequired(true)
						)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('first_four')
						.setDescription('Bet on 0-1-2-3.')
						.addIntegerOption(bet)
				)
		)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('outside')
				.setDescription('Place an outside bet.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('half')
						.setDescription(
							'A bet that the number will be in the chosen range.'
						)
						.addStringOption((option) =>
							option
								.setName('choice')
								.setDescription('Choose low or high')
								.addChoices([
									['low', 'low'],
									['high', 'high'],
								])
								.setRequired(true)
						)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('color')
						.setDescription('A bet that the number will be the chosen color.')
						.addStringOption((option) =>
							option
								.setName('choice')
								.setDescription('Choose red or black')
								.addChoices([
									['red', 'red'],
									['black', 'black'],
								])
								.setRequired(true)
						)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('even_or_odd')
						.setDescription('A bet that the number will be of the chosen type.')
						.addStringOption((option) =>
							option
								.setName('choice')
								.setDescription('Choose even or odd.')
								.addChoices([
									['even', 'even'],
									['odd', 'odd'],
								])
								.setRequired(true)
						)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('dozen')
						.setDescription(
							'A bet that the number will be in the chosen dozen.'
						)
						.addStringOption((option) =>
							option
								.setName('choice')
								.setDescription('Choose a dozen.')
								.addChoices([
									['first dozen', 'first'],
									['second dozen', 'second'],
									['third dozen', 'third'],
								])
								.setRequired(true)
						)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('column')
						.setDescription(
							'A bet that the number will be in the chosen vertical column.'
						)
						.addStringOption((option) =>
							option
								.setName('choice')
								.setDescription('Choose a column.')
								.addChoices([
									['first column', 'first'],
									['second column', 'second'],
									['third column', 'third'],
								])
								.setRequired(true)
						)
						.addIntegerOption(bet)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('snake')
						.setDescription(
							'A special bet that covers the numbers 1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, and 34.'
						)
						.addIntegerOption(bet)
				)
		),
	//https://crescent.edu/post/the-basic-rules-of-roulette

	async run(interaction) {
		let color = 'GREEN',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '',
			bet;
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
				if (option.value < 0 || option.value > 36) {
					color = 'RED';
					description += `Invalid \`${option.name}\`: \`${option.value}\`\n`;
				} else {
					nums.push(option.value);
				}
			}

			if (option.name === 'bet') {
				if (bet < 0 || bet > wallet) {
					color = 'RED';
					description += `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}\n`;
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
		} else if (interaction.options._subcommand === 'color') {
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
				this.data.name,
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
