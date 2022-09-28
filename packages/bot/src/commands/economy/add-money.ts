import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { EmbedBuilder } from '@discordjs/builders';
import {
	APIApplicationCommandInteractionDataStringOption,
	APIApplicationCommandInteractionDataUserOption,
	APIInteractionResponseChannelMessageWithSource,
	InteractionResponseType,
	PermissionFlagsBits,
} from 'discord-api-types/v10';
import { Router } from 'express';

import { Member, User } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Manipulate balances')
		.setModule('ECONOMY')
		.setFormat('add-money <user> <amount> <target>')
		.setExamples(['add-money @user 300 wallet', 'add-money @user 100 treasury'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addUserOption((option) => option.setName('target').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) => option
			.setName('balance')
			.setDescription('Specify the balance')
			.setRequired(true)
			.addChoices({ name: 'Wallet', value: 'wallet' }, { name: 'Treasury', value: 'treasury' }));

	public execution = Router()
		.use('/', async (req, res) => {
			const userId = (req.ctx.interaction.data.options.find((option) => option.name === 'target') as APIApplicationCommandInteractionDataUserOption).value;
			const amount = parseString((req.ctx.interaction.data.options.find((option) => option.name === 'amount') as APIApplicationCommandInteractionDataStringOption).value);
			const balance = (req.ctx.interaction.data.options.find((option) => option.name === 'balance') as APIApplicationCommandInteractionDataStringOption).value;
			if (!amount) throw new CommandError(`Invalid amount: \`${amount}\``);
			const wallet = balance === 'wallet' ? amount : 0;
			const treasury = balance === 'treasury' ? amount : 0;
			await User.upsert({ id: userId }, ['id']);
			await Member.upsert({ userId, guildId: req.ctx.interaction.guild_id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId, guildId: req.ctx.interaction.guild_id });
			await recordTransaction(req.ctx.client, req.ctx.guildEntity, targetEntity, req.ctx.memberEntity, 'ADD_MONEY', wallet, treasury);

			const embed = new EmbedBuilder()
				.setTitle('Adding Money...')
				.setDescription(`Added ${req.ctx.guildEntity.currency} \`${parseNumber(amount)}\` to <@!${userId}>'s \`${balance}\``);
			res.send(({ type: InteractionResponseType.ChannelMessageWithSource, data: { embeds: [embed] } } as APIInteractionResponseChannelMessageWithSource));
		});
}
