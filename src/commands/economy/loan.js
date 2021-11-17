const ms = require('ms');

const loanSchema = require('@schemas/loan-sch');
const { isValidObjectId } = require('mongoose');

const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loan')
		.setDescription(commands.commands.loan.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('propose')
				.setDescription('Add a loan to the registry.')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription('Specify a user.')
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('principal')
						.setDescription('Specify a principal.')
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('repayment')
						.setDescription('Specify a repayment.')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('length')
						.setDescription('Specify a length.')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('cancel')
				.setDescription('Cancel a pending loan in the registry.')
				.addStringOption((option) =>
					option
						.setName('loan_id')
						.setDescription('Specify a loan.')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('accept')
				.setDescription('Accept a pending loan in the registry.')
				.addStringOption((option) =>
					option
						.setName('loan_id')
						.setDescription('Specify a loan.')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('decline')
				.setDescription('Decline a pending loan in the registry.')
				.addStringOption((option) =>
					option
						.setName('loan_id')
						.setDescription('Specify a loan.')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View the loan registry.')
				.addStringOption((option) =>
					option.setName('loan_id').setDescription('Specify a loan.')
				)
				.addUserOption((option) =>
					option.setName('user').setDescription('Specify a user')
				)
		),
	async run(interaction) {
		const guildID = interaction.guild.id;

		let color = 'BLURPLE',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '',
			footer = '';

		const cSymbol = await util.getCurrencySymbol(guildID);
		const { wallet, treasury } = await util.getEconInfo(
			guildID,
			interaction.member.id
		);

		if (interaction.options.getSubcommand() === 'propose') {
			const targetMember = interaction.options.getMember('user');
			const principal = interaction.options.getInteger('principal');
			const repayment = interaction.options.getInteger('repayment');
			const length = interaction.options.getString('length');

			//Validation
			if (targetMember.user.id === interaction.member.user.id) {
				color = 'RED';
				description += 'You cannot give yourself a loan!\n';
			}
			if (principal < 1 || repayment < 1) {
				color = 'RED';
				description += `${loan < 1 ? `Invalid loan: ${cSymbol}${loan}\n` : ''}
        ${repayment < 1 ? `Invalid repayment: ${cSymbol}${repayment}\n` : ''}`;
			} else if (principal > treasury) {
				color = 'RED';
				description += `Insufficient treasury: ${cSymbol}${principal.toLocaleString()}\nCurrent balance: ${cSymbol}${treasury.toLocaleString()}`;
			}
			if (!ms(length)) {
				color = 'RED';
				description += `Invalid length: \`${length}\`\nExamples: \`\`\`2 hours\n1h\n1m\n20m10s\n100\`\`\`\n`;
				footer = 'Number is measured in ms';
			}

			//Exit if invalid parameter
			if (color === 'RED') {
				await interaction.reply({
					embeds: [util.embedify(color, title, icon_url, description, footer)],
					ephemeral: true,
				});

				return;
			}

			//Create loan schema - to be handled in a dedicated feature
			const loan = await new loanSchema({
				guildID,
				borrowerID: targetMember.user.id,
				lenderID: interaction.member.user.id,
				principal,
				repayment,
				expires: new Date(new Date().getTime() + ms(length)),
				pending: true,
				active: true,
				complete: false,
			}).save();

			//Execute principal transaction
			await util.transaction(
				guildID,
				interaction.member.id,
				this.data.name,
				`Loan to <@!${targetMember.user.id}> | Loan ID \`${loan._id}\``,
				0,
				-principal,
				-principal
			);

			color = 'GREEN';
			description = `Successfully created a loan.\nLoan \`${
				loan._id
			}\` | <t:${loan.createdAt.getMilliseconds()}:f>\nExpires in <t:${loan.expires.getMilliseconds()}:R>\nBorrower: <@!${
				loan.borrowerID
			}>\nPending: \`${loan.pending}\` | Active: \`${
				loan.active
			}\` | Complete: \`${loan.complete}\`\nPrincipal: ${cSymbol}${
				loan.principal
			} | Repayment: ${cSymbol}${loan.repayment}`;
		} else if (interaction.options.getSubcommand() === 'cancel') {
			const _id = interaction.options.getString('loan_id');

			if (isValidObjectId(_id)) {
				const econManagerRole = interaction.guild.roles.cache.find((r) => {
					return r.name.toLowerCase() === 'economy manager';
				});

				let loan;
				if (interaction.member.roles.cache.has(econManagerRole.id)) {
					loan = await loanSchema.findOneAndDelete({
						_id,
						pending: true,
					});
				} else {
					loan = await loanSchema.findOneAndDelete({
						_id,
						userID: interaction.member.id,
						pending: true,
					});
				}

				if (loan) {
					color = 'GREEN';
					description = `Successfully canceled loan.\nLoan ID: \`${loan._id}\``;

					//Refund
					await util.transaction(
						guildID,
						loan.lenderID,
						this.data.name,
						`Loan to <@!${loan.borrowerID}> \`canceled\` | Loan ID: \`${loan._id}\``,
						0,
						loan.principal,
						loan.principal
					);
				} else {
					color = 'RED';
					description = `Could not find pending loan with ID \`${_id}\``;
				}
			} else {
				color = 'RED';
				description = `Invalid loan ID: \`${_id}\``;
			}
		} else if (interaction.options.getSubcommand() === 'accept') {
			const _id = interaction.options.getString('loan_id');

			//Validate ID
			if (isValidObjectId(_id)) {
				const loan = await loanSchema.findOneAndUpdate(
					{
						_id,
						borrowerID: interaction.member.id,
						pending: true,
					},
					{
						pending: false,
					}
				);

				if (loan) {
					color = 'GREEN';
					description = `Successfully accepted loan.\nLoan ID: \`${loan._id}\``;

					//Transfer funds
					await util.transaction(
						guildID,
						interaction.member.user.id,
						this.data.name,
						`Loan from <@!${loan.lenderID}> \`accepted\` | Loan ID: \`${loan._id}\``,
						loan.principal,
						0,
						loan.principal
					);
				} else {
					color = 'RED';
					description = `Could not find loan with ID \`${_id}\``;
				}
			} else {
				color = 'RED';
				description = `Invalid loan ID: \`${_id}\``;
			}
		} else if (interaction.options.getSubcommand() === 'decline') {
			const _id = interaction.options.getString('loan_id');

			//Validate ID
			if (isValidObjectId(_id)) {
				const loan = await loanSchema.findOneAndUpdate(
					{
						_id,
						borrowerID: interaction.member.id,
						pending: true,
					},
					{
						pending: false,
						active: false,
					}
				);

				if (loan) {
					color = 'GREEN';
					description = `Successfully declined loan.\nLoan ID: \`${loan._id}\``;

					//Refund
					await util.transaction(
						guildID,
						loan.lenderID,
						this.data.name,
						`Loan to <@!${loan.borrowerID}> \`declined\` | Loan ID: \`${loan._id}\``,
						0,
						loan.principal,
						loan.principal
					);
				} else {
					color = 'RED';
					description = `Could not find loan with id \`${_id}\``;
				}
			} else {
				color = 'RED';
				description = `Invalid loan ID: \`${_id}\``;
			}
		} else if (interaction.options.getSubcommand() === 'view') {
			//View all loans
			if (!interaction.options._hoistedOptions.length) {
				color = 'GREEN';
				title = `Loans in ${interaction.guild.name}`;
				icon_url = interaction.guild.iconURL();

				const loans = await loanSchema.find({
					guildID,
				});

				let n = 0;
				for (const loan of loans) {
					description += `Loan \`${
						loan._id
					}\` | ${loan.createdAt.toLocaleString()}\n`;
					n++;
				}

				footer = `Total Loans: ${n}`;
			}

			//View loan by ID
			else if (interaction.options.getString('loan_id')) {
				const _id = interaction.options.getString('loan_id');
				color = 'GREEN';

				if (isValidObjectId(_id)) {
					const loan = await loanSchema.findOne({
						guildID,
						_id,
					});

					if (loan) {
						description = `Loan \`${
							loan._id
						}\` | <t:${loan.createdAt.getMilliseconds()}:f>\nExpires in <t:${loan.expires.getMilliseconds()}:R>\nBorrower: <@!${
							loan.borrowerID
						}>\nPending: \`${loan.pending}\` | Active: \`${
							loan.active
						}\` | Complete: \`${loan.complete}\`\nPrincipal: ${cSymbol}${
							loan.principal
						} | Repayment: ${cSymbol}${loan.repayment}`;
					} else {
						color = 'RED';
						description = `Could not find loan with id \`${_id}\``;
					}
				} else {
					color = 'RED';
					description = `Invalid loan ID: \`${_id}\``;
				}
			}

			//View loans by user
			else if (interaction.options.getUser('user')) {
				const user = interaction.options.getUser('user');

				const outgoingLoans = await loanSchema.find({
					guildID,
					lenderID: user.id,
				});

				const incomingLoans = await loanSchema.find({
					guildID,
					borrowerID: user.id,
				});

				for (const outgoingLoan of outgoingLoans) {
					description += `Outgoing Loan \`${
						outgoingLoan._id
					}\`\nExpires in <t:${loan.expires.getMilliseconds()}:R>\nBorrower: <@!${
						outgoingLoan.borrowerID
					}>\nPending: \`${outgoingLoan.pending}\` | Active: \`${
						outgoingLoan.active
					}\` | Complete: \`${outgoingLoan.complete}\`\nPrincipal: ${cSymbol}${
						outgoingLoan.principal
					} | Repayment: ${cSymbol}${outgoingLoan.repayment}\n\n`;
				}

				for (const incomingLoan of incomingLoans) {
					description += `Incoming Loan \`${
						incomingLoan._id
					}\`\nExpires in <t:${loan.expires.getMilliseconds()}:R>\nLender: <@!${
						incomingLoan.lenderID
					}>\nPending: \`${incomingLoan.pending}\` | Active: \`${
						incomingLoan.active
					}\` | Complete: \`${incomingLoan.complete}\`\nPrincipal: ${cSymbol}${
						incomingLoan.principal
					} | Repayment: ${cSymbol}${incomingLoan.repayment}\n\n`;
				}

				if (description.length === 0) {
					description = `No loans found.`;
				}
			}
		}

		await interaction.reply({
			embeds: [util.embedify(color, title, icon_url, description, footer)],
		});
	},
};
