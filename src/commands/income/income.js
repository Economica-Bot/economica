const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const incomeSchema = require('@schemas/income-sch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('income')
		.setDescription(commands.commands.income.description),
	async run(interaction) {
		const incomeEmbed = util.embedify(
			'BLURPLE',
			`${interaction.guild.name}'s Income Commands`,
			interaction.guild.iconURL(),
			'Use `command config income_command <command>` to configure income commands.'
		);

		let incomeCommands = (
			await incomeSchema.findOne({ guildID: interaction.guild.id })
		).incomeCommands;

		incomeCommands.forEach((command) => {
			let description = '';
			for (const property in command) {
				if (property !== 'command')
					description += `${property}: ${command[property]}\n`;
			}

			incomeEmbed.addField(
				`__${command.command}__`,
				`\`\`\`${description}\`\`\``,
				true
			);
		});

		await interaction.reply({ embeds: [incomeEmbed] });
	},
};
