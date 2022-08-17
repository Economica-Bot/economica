import { ChatInputCommandInteraction } from 'discord.js';
import ms from 'ms';

import { DEV_COOLDOWN_EXEMPT, DEV_MODULE_EXEMPT, DEVELOPER_IDS } from '../config';
import { Command } from '../entities';
import { CommandError, Context } from '../structures';

async function checkCooldown(ctx: Context<ChatInputCommandInteraction<'cached'>>): Promise<boolean> {
	const { incomes, intervals } = ctx.guildEntity;
	if (!(ctx.interaction.commandName in { ...incomes, ...intervals })) return true;
	const command = await Command.findOne({
		order: { createdAt: 'DESC' },
		where: {
			member: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId },
			command: ctx.interaction.commandName,
		},
	});
	if (!command) return true;
	const { cooldown } = { ...intervals, ...incomes }[ctx.interaction.commandName];
	if (command.createdAt.getTime() + cooldown > Date.now()) throw new CommandError(`You may run this command in \`${ms(command.createdAt.getTime() + cooldown - Date.now())}\`\nCooldown: ${ms(cooldown)}`);

	return true;
}

export async function commandCheck(ctx: Context<ChatInputCommandInteraction<'cached'>>): Promise<boolean> {
	const isDeveloper = DEVELOPER_IDS.includes(ctx.interaction.user.id);
	if (!ctx.command.metadata.enabled) throw new CommandError('This command is disabled.');
	if (!ctx.command.metadata.global && !ctx.interaction.inGuild()) throw new CommandError('This command may only be used within servers.');
	if (!ctx.interaction.inGuild()) return true;
	if (!ctx.command.metadata.clientPermissions.every((permission) => ctx.interaction.appPermissions.has(permission))) throw new CommandError('I am missing permissions.');
	if (!isDeveloper || !DEV_COOLDOWN_EXEMPT) {
		const valid = await checkCooldown(ctx);
		if (!valid) throw new CommandError('This command is still under cooldown.');
	}
	if ((!isDeveloper || !DEV_MODULE_EXEMPT) && !ctx.guildEntity.modules[ctx.command.metadata.module].enabled) throw new CommandError(`The \`${ctx.command.metadata.module}\` module is not enabled in this server.`);

	return true;
}
