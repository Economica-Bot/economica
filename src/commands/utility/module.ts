import { ApplicationCommandDataResolvable, PermissionFlagsBits } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setModule('UTILITY')
		.setFormat('module <view | add | remove> [module]')
		.setExamples(['module view', 'module add Interval', 'module remove Interval'])
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	public execution = new ExecutionNode()
		.setName('Module Configuration Menu')
		.setValue('module')
		.setDescription('Manage server modules')
		.setOptions((ctx) => Object
			.entries(ctx.guildEntity.modules)
			.filter(([, module]) => module.type === 'SPECIAL')
			.map(([name, module]) => new ExecutionNode()
				.setName(name)
				.setValue(`module_${name}`)
				.setType('select')
				.setDescription(`\`${module.enabled ? 'ENABLED' : 'DISABLED'}\`\nType: \`${module.type}\``)
				.setOptions(() => [
					new ExecutionNode()
						.setName('Enable')
						.setValue(`module_${name}_enable`)
						.setType('button')
						.setDescription(`Enabled the \`${name}\` module.`)
						.setPredicate(() => !module.enabled)
						.setExecution(async (ctx) => {
							ctx.userEntity.keys -= 1;
							await ctx.userEntity.save();
							ctx.guildEntity.modules[name].enabled = true;
							ctx.guildEntity.modules[name].user = ctx.userEntity.id;
							await ctx.guildEntity.save();
							const oldCommandData = (await ctx.interaction.guild.commands.fetch()).map((command) => command.toJSON()) as ApplicationCommandDataResolvable[];
							const newCommandData = ctx.interaction.client.commands.filter((command) => command.data.module === name).map((command) => command.data.toJSON());
							await ctx.interaction.guild.commands.set(oldCommandData.concat(newCommandData));
						}),
					new ExecutionNode()
						.setName('Disable')
						.setValue(`module_${name}_disable`)
						.setType('button')
						.setDescription(`Disabled the \`${name}\` module.`)
						.setPredicate(() => module.enabled)
						.setExecution(async (ctx) => {
							ctx.userEntity.keys += 1;
							await ctx.userEntity.save();
							ctx.guildEntity.modules[name].enabled = false;
							ctx.guildEntity.modules[name].user = null;
							await ctx.guildEntity.save();
							const applicationCommands = await ctx.interaction.guild.commands.fetch();
							ctx.interaction.client.commands
								.filter((command) => command.data.module === name)
								.forEach(async (command) => {
									const cmd = applicationCommands.find((applicationCommand) => applicationCommand.name === command.data.name);
									if (cmd) await ctx.interaction.guild.commands.delete(cmd);
								});
						}),
				])));
}
