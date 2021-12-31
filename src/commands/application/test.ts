import { CommandInteraction } from 'discord.js';
import { EconomicaClient, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('test')
		.setDescription('test command')
		.setGroup('application')
		.setDevOnly(true)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('test1group')
				.setDescription('test1desc')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('test1subcommand')
						.setDescription('test1desc')
						.setFormat('<test1> <test2>')
						.setExamples(['test1', 'test2'])
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test2subcommand').setDescription('test2desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test3subcommand').setDescription('test3desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test4subcommand').setDescription('test4desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test5subcommand').setDescription('test5desc')
				)
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('test2group')
				.setDescription('test1desc')
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test6subcommand').setDescription('test1desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test7subcommand').setDescription('test2desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test8subcommand').setDescription('test3desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test9subcommand').setDescription('test4desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test10subcommand').setDescription('test5desc')
				)
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('test3group')
				.setDescription('test1desc')
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test11subcommand').setDescription('test1desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test12subcommand').setDescription('test2desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test13subcommand').setDescription('test3desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test14subcommand').setDescription('test4desc')
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test15subcommand').setDescription('test5desc')
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('test16subcommand').setDescription('test6desc')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('test17subcommand').setDescription('test7desc')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('test18subcommand').setDescription('test8desc')
		);

	execute = async function (client: EconomicaClient, interaction: CommandInteraction) {
		interaction.reply('test');
	};
}
