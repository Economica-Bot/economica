import { parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';
import { connection, Document, isValidObjectId, Model } from 'mongoose';

import { getEconInfo } from '.';
import { Application, Infraction, Loan, Member, Transaction } from '../models';
import { Corporation } from '../models/corporations';
import { Context } from '../structures';
import { Moderation } from '../typings';

export async function validateAmount(
	ctx: Context,
	target: 'wallet' | 'treasury'
): Promise<{ validated: boolean; result?: number }> {
	const { [target]: balance } = await getEconInfo(ctx.memberDocument);
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
	target: 'Loan'
): Promise<{ valid: boolean; document?: Loan; model: Model<Loan> }>;
export async function validateObjectId(
	ctx: Context,
	target: 'Infraction'
): Promise<{ valid: boolean; document?: Infraction; model: Model<Infraction> }>;
export async function validateObjectId(
	ctx: Context,
	target: 'Transaction'
): Promise<{ valid: boolean; document?: Transaction; model: Model<Transaction> }>;
export async function validateObjectId(
	ctx: Context,
	target: 'Corporation'
): Promise<{ valid: boolean; document?: Corporation; model: Model<Corporation> }>;
export async function validateObjectId(
	ctx: Context,
	target: 'Loan' | 'Infraction' | 'Transaction' | 'Corporation' | 'Application'
): Promise<{
	valid: boolean;
	document?: Document<any>;
	model?: Model<Loan> | Model<Infraction> | Model<Transaction> | Model<Corporation> | Model<Application>;
}> {
	const _id = ctx.interaction.options.getString(`${target.toLowerCase()}_id`, false);
	let document: Document;

	if (_id && !isValidObjectId(_id)) {
		await ctx.embedify('error', 'user', `Please enter a valid ${target} id.`, true);
		return { valid: false };
	} else if (_id) {
		const model = connection.models[target];
		document = await model.findOne({ _id });
		if (!document) {
			await ctx.embedify('error', 'user', `Use /${target} view for a list of ids.`, true);
			return { valid: false };
		}
	} else {
		const model = connection.models[target];
		return { valid: true, document: null, model };
	}

	return { valid: true, document };
}

export async function validateSubdocumentObjectId(ctx: Context, target: 'Application', parent: Corporation): Promise<{valid: boolean, document: Application}>;
export async function validateSubdocumentObjectId(ctx: Context, target: 'Infraction', parent: Member): Promise<{valid: boolean, document: Infraction}>;
export async function validateSubdocumentObjectId(
	ctx: Context,
	target: 'Infraction' | 'Application',
	parent: Member | Corporation
): Promise<{ valid: boolean; document?: Application | Infraction }> {
	const _id = ctx.interaction.options.getString(`${target.toLowerCase()}_id`, false);
	if (_id && !isValidObjectId(_id)) {
		await ctx.embedify('error', 'user', `Please enter a valid ${target} id.`, true);
		return { valid: false };
	} else if (_id) {
		let document;
		if (target === 'Infraction') {
			if (isMember(parent)) {
				document = parent.infractions.find((doc: Document) => `${doc._id}` === _id);
			}
		} else if (target === 'Application') {
			if (isCorporation(parent)) {
				document = parent.applications.find((doc: Document) => `${doc._id}` === _id);
			}
		}

		if (!document) {
			await ctx.embedify('error', 'user', `Use /${target} view for a list of ids.`, true);
			return { valid: false };
		}

		return { valid: true, document };
	} else {
		return { valid: true };
	}
}

function isMember(parent: any): parent is Member {
	return (parent as Member).infractions !== undefined;
}

function isCorporation(parent: any): parent is Corporation {
	return (parent as Corporation).applications !== undefined;
}
