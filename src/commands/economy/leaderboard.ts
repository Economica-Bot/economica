import { parseNumber } from '@adrastopoulos/number-parser';
import { Member } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top balances')
		.setModule('ECONOMY')
		.setFormat('leaderboard [page]')
		.setExamples(['leaderboard', 'leaderboard 3']);

	public execute = new ExecutionBuilder()
		.setName('Leaderboard')
		.setValue('leaderboard')
		.setDescription('View the server leaderboard')
		.setOptions([
			new ExecutionBuilder()
				.setName('Wallet')
				.setValue('wallet')
				.setDescription('View the leaderboard by wallet')
				.setPagination(
					async (ctx) => Member.find({ relations: ['guild'], order: { wallet: 'DESC' }, where: { guildId: ctx.interaction.guildId } }),
					(member) => new ExecutionBuilder()
						.setName(`Total: ${member.guild.currency} ${parseNumber(member.wallet)}`)
						.setValue(member.userId)
						.setDescription(`<@${member.userId}>`),
				),
			new ExecutionBuilder()
				.setName('Treasury')
				.setValue('treasury')
				.setDescription('View the leaderboard by treasury')
				.setPagination(
					async (ctx) => Member.find({ relations: ['guild'], order: { treasury: 'DESC' }, where: { guildId: ctx.interaction.guildId } }),
					(member) => new ExecutionBuilder()
						.setName(`${member.guild.currency} ${parseNumber(member.treasury)}`)
						.setValue(member.userId)
						.setDescription(`<@${member.userId}>`),
				),
			new ExecutionBuilder()
				.setName('Total')
				.setValue('total')
				.setDescription('View the leaderboard by total wealth')
				.setPagination(
					async (ctx) => Member.find({ relations: ['guild'], order: { wallet: 'DESC', treasury: 'DESC' }, where: { guildId: ctx.interaction.guildId } }),
					(member) => new ExecutionBuilder()
						.setName(`Total: ${member.guild.currency} ${parseNumber(member.wallet + member.treasury)}`)
						.setValue(member.userId)
						.setDescription(`<@${member.userId}>`),
				),
		]);
}
