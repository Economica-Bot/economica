import { parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';
import { Document, isValidObjectId, Model } from 'mongoose';

import { getEconInfo } from '.';
import { Infraction, InfractionModel, Loan, LoanModel, Transaction, TransactionModel } from '../models';
import { Context } from '../structures';
import { Moderation } from '../typings';

export async function validateAmount(
	ctx: Context,
	target: 'wallet' | 'treasury'
): Promise<{ validated: boolean; result?: number }> {
	const { [target]: balance } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
	const amount = ctx.interaction.options.getString('amount');
	const result = amount === 'all' ? balance : parseString(amount);

	if (!result && result !== 0) {
		await ctx.embedify('error', 'user', 'Please enter a valid input.', true);
		return { validated: false };
	} else {
		if (result < 1) {
			await ctx.embedify('error', 'user', `Input less than 1.`, true);
			return { validated: false };
		} else if (result > balance) {
			await ctx.embedify(
				'error',
				'user',
				`Input exceeds current ${target}: ${ctx.guildDocument.currency}${balance.toLocaleString()}`,
				true
			);

			return { validated: false };
		} else {
			return { validated: true, result };
		}
	}
}

export async function validateTarget(ctx: Context): Promise<boolean> {
	const type = ctx.interaction.commandName as Moderation;
	const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
	const target = ctx.interaction.options.getMember('target') as GuildMember;

	if (target.id === ctx.interaction.user.id) {
		await ctx.embedify('warn', 'user', 'You cannot target yourself.', true);
		return false;
	} else if (target.id === ctx.client.user.id) {
		await ctx.embedify('warn', 'user', 'You cannot target me.', true);
		return false;
	} else if (target.roles.highest.position > member.roles.highest.position) {
		await ctx.embedify('warn', 'user', "Target's roles are too high.", true);
		return false;
	} else if (type === 'ban' && !target.bannable) {
		await ctx.embedify('warn', 'user', 'Target is unbannable.', true);
		return false;
	} else if (type === 'kick' && !target.kickable) {
		await ctx.embedify('warn', 'user', 'Target is unkickable.', true);
		return false;
	} else if (type === 'timeout') {
		if (!target.moderatable) {
			await ctx.embedify('warn', 'user', 'Target is unmoderatable.', true);
			return false;
		} else if (target.communicationDisabledUntil && target.communicationDisabledUntil.getTime() > Date.now()) {
			await ctx.embedify('warn', 'user', `Target is already in a timeout.`, true);
			return false;
		}
	} else if (type === 'untimeout') {
		if (target.isCommunicationDisabled) {
			await ctx.embedify('warn', 'user', 'Target is not in a timeout.', true);
			return false;
		}
	}

	return true;
}

export async function validateObjectId(
	ctx: Context,
	target: 'loan'
): Promise<{ valid: boolean; document: Loan & Document<Loan>; model: Model<Loan> }>;
export async function validateObjectId(
	ctx: Context,
	target: 'infraction'
): Promise<{ valid: boolean; document: Infraction & Document<Infraction>; model: Model<Infraction> }>;
export async function validateObjectId(
	ctx: Context,
	target: 'transaction'
): Promise<{ valid: boolean; document: Transaction & Document<Transaction>; model: Model<Transaction> }>;
export async function validateObjectId(
	ctx: Context,
	target: 'loan' | 'infraction' | 'transaction'
): Promise<{ valid: boolean; document?: Document; model?: Model<Loan> | Model<Infraction> | Model<Transaction> }> {
	const _id = ctx.interaction.options.getString(`${target}_id`, false);
	let document: Document;

	if (_id && !isValidObjectId(_id)) {
		await ctx.embedify('error', 'user', `Please enter a valid ${target} id.`, true);
		return { valid: false };
	} else if (_id) {
		if (target === 'loan') {
			document = await LoanModel.findOne({ _id });
		} else if (target === 'infraction') {
			document = await InfractionModel.findOne({ _id });
		} else if (target === 'transaction') {
			document = await TransactionModel.findOne({ _id });
		}

		if (!document) {
			await ctx.embedify('error', 'user', `Use ${target} view for a list of ids.`, true);
			return { valid: false };
		}
	} else {
		if (target === 'loan') return { valid: true, document: null, model: LoanModel };
		else if (target === 'infraction') return { valid: true, document: null, model: InfractionModel };
		else if (target === 'transaction') return { valid: true, document: null, model: TransactionModel };
	}

	return { valid: true, document };
}
