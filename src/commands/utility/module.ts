import { ApplicationCommandDataResolvable, PermissionFlagsBits } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setModule('UTILITY')
		.setFormat('module <view | add | remove> [module]')
		.setExamples(['module view', 'module add Interval', 'module remove Interval'])
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	public execution = new Router()
		.get('', (ctx) => new ExecutionNode()
			.setName('Module Configuration Menu')
			.setDescription('Enable or disable modules on this server')
			.setOptions(...Object
				.entries(ctx.guildEntity.modules)
				.filter(([, module]) => module.type === 'SPECIAL')
				.map(([name, module]) => ['select', `/module/${name}`, name, `\`${module.enabled ? 'ENABLED' : 'DISABLED'}\`\nType: \`${module.type}\``] as const)))
		.get('/module/:module', (ctx, params) => new ExecutionNode()
			.setName(params.module)
			.setDescription(`\`${ctx.guildEntity.modules[params.module].enabled ? 'ENABLED' : 'DISABLED'}\`\nType: \`${ctx.guildEntity.modules[params.module].type}\``)
			.setOptions(
				ctx.guildEntity.modules[params.module].enabled
					? ['button', `/module/${params.module}/disable`, 'Disable']
					: ['button', `/module/${params.module}/enable`, 'Enable'],
				['back', ''],
			))
		.get('/module/:module/disable', async (ctx, params) => {
			const { module } = params;
			ctx.userEntity.keys += 1;
			await ctx.userEntity.save();
			ctx.guildEntity.modules[module].enabled = false;
			ctx.guildEntity.modules[module].user = null;
			await ctx.guildEntity.save();
			const applicationCommands = await ctx.interaction.guild.commands.fetch();
			ctx.interaction.client.commands
				.filter((command) => command.metadata.module === module)
				.forEach(async (command) => {
					const cmd = applicationCommands.find((applicationCommand) => applicationCommand.name === command.metadata.name);
					if (cmd) await ctx.interaction.guild.commands.delete(cmd);
				});
			return new ExecutionNode()
				.setName('Disabling...')
				.setDescription(`${Emojis.CHECK} Disabled the \`${module}\` module`)
				.setOptions(['back', '']);
		})
		.get('/module/:module/enable', async (ctx, params) => {
			const { module } = params;
			ctx.userEntity.keys -= 1;
			await ctx.userEntity.save();
			ctx.guildEntity.modules[module].enabled = true;
			ctx.guildEntity.modules[module].user = ctx.userEntity.id;
			await ctx.guildEntity.save();
			const oldCommandData = (await ctx.interaction.guild.commands.fetch()).map((command) => command.toJSON() as ApplicationCommandDataResolvable);
			const newCommandData = ctx.interaction.client.commands
				.filter((command) => command.metadata.module === module)
				.map((command) => command.metadata.toJSON());
			await ctx.interaction.update({ content: 'Enabling...', embeds: [], components: [] });
			await ctx.interaction.guild.commands.set(oldCommandData.concat(newCommandData));
			return new ExecutionNode()
				.setName('Enable...')
				.setDescription(`${Emojis.CHECK} Enabled the \`${module}\` module`)
				.setOptions(['back', '']);
		});
}
