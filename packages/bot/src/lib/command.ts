import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import ms from 'ms';

import { DEV_COOLDOWN_EXEMPT, DEV_MODULE_EXEMPT, DEVELOPER_IDS } from '../config';
import { Command } from '../entities';
import { CommandError, Context } from '../structures';

async function checkCooldown(ctx: Context<APIChatInputApplicationCommandInteraction>): Promise<boolean> {
	const { incomes, intervals } = ctx.guildEntity;
	if (!(ctx.interaction.data.name in { ...incomes, ...intervals })) return true;
	const command = await Command.findOne({
		order: { createdAt: 'DESC' },
		where: {
			member: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId },
			command: ctx.interaction.data.name,
		},
	});
	if (!command) return true;
	const { cooldown } = { ...intervals, ...incomes }[ctx.interaction.data.name];
	if (command.createdAt.getTime() + cooldown > Date.now()) throw new CommandError(`You may run this command in \`${ms(command.createdAt.getTime() + cooldown - Date.now())}\`\nCooldown: ${ms(cooldown)}`);

	return true;
}

export async function commandCheck(ctx: Context<APIChatInputApplicationCommandInteraction>): Promise<boolean> {
	const isDeveloper = DEVELOPER_IDS.includes(ctx.interaction.member.user.id);
	if (!ctx.command.metadata.enabled) throw new CommandError('This command is disabled.');
	if (!ctx.command.metadata.global && !ctx.interaction.guild_id) throw new CommandError('This command may only be used within servers.');
	if (!ctx.interaction.guild_id) return true;
	if (!(BigInt(ctx.command.metadata.clientPermissions) & BigInt(ctx.interaction.app_permissions))) throw new CommandError('I am missing permissions.');
	if (!isDeveloper || !DEV_COOLDOWN_EXEMPT) {
		const valid = await checkCooldown(ctx);
		if (!valid) throw new CommandError('This command is still under cooldown.');
	}
	if ((!isDeveloper || !DEV_MODULE_EXEMPT) && !ctx.guildEntity.modules[ctx.command.metadata.module].enabled) throw new CommandError(`The \`${ctx.command.metadata.module}\` module is not enabled in this server.`);

	return true;
}
