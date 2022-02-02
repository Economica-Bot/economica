import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('test')
		.setDescription('test command')
		.setGroup('APPLICATION')
		.setAuthority('MODERATOR')
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setAuthority('MANAGER')
				.setName('test1group')
				.setDescription('test1desc')
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test1subcommand').setDescription('test1desc').setFormat('<test1> <test2>')
				)
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test2subcommand').setDescription('test2desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test3subcommand').setDescription('test3desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test4subcommand').setDescription('test4desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test5subcommand').setDescription('test5desc'))
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('test2group')
				.setDescription('test1desc')
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test6subcommand').setDescription('test1desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test7subcommand').setDescription('test2desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test8subcommand').setDescription('test3desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test9subcommand').setDescription('test4desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test10subcommand').setDescription('test5desc'))
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('test3group')
				.setDescription('test1desc')
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('test11subcommand').setDescription('test1desc').setExamples(['<test1>'])
				)
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test12subcommand').setDescription('test2desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test13subcommand').setDescription('test3desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test14subcommand').setDescription('test4desc'))
				.addEconomicaSubcommand((subcommand) => subcommand.setName('test15subcommand').setDescription('test5desc'))
		)
		.addEconomicaSubcommand((subcommand) => subcommand.setName('test16subcommand').setDescription('test6desc'))
		.addEconomicaSubcommand((subcommand) => subcommand.setName('test17subcommand').setDescription('test7desc'))
		.addEconomicaSubcommand((subcommand) => subcommand.setName('test18subcommand').setDescription('test8desc'));

	public execute = async (ctx: Context): Promise<Message> => {
		return await ctx.embedify('info', 'user', 'test', true);
	};
}
