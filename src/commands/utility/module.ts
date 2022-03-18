import { Module } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Modules, ModuleString } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setModule('UTILITY')
		.setFormat('module <view | add | remove> [module]')
		.setExamples(['module view', 'module add Interval', 'module remove Interval'])
		.setAuthority('ADMINISTRATOR')
		.setDefaultPermission(false)
		.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View the enabled modules on this server'))
		.addSubcommand((subcommand) => subcommand
			.setName('add')
			.setDescription('Add a module to this server.')
			.addStringOption((option) => option.setName('module').setDescription('Specify a module').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('remove')
			.setDescription('Remove a module from this server.')
			.addStringOption((option) => option.setName('module').setDescription('Specify a module').setRequired(true)));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const moduleName = ctx.interaction.options.getString('module', false) as ModuleString;
		if (moduleName && !(moduleName in Modules)) {
			await ctx.embedify('error', 'user', `Invalid module: \`${moduleName}\``).send(true);
		} else if (subcommand === 'view') {
			const modulesArr = Object.keys(Modules) as ModuleString[];
			const enabledModulesArr = modulesArr.filter((module) => ctx.guildEntity.modules.includes(module));
			const disabledModulesArr = modulesArr.filter((module) => !ctx.guildEntity.modules.includes(module));
			const embed = ctx.embedify('info', 'guild', "View the server's modules").addFields(
				{ name: 'Enabled Modules', value: `\`${enabledModulesArr.join('`, `')}\``, inline: true },
				{ name: 'Disabled Modules', value: `\`${disabledModulesArr.join('`, `')}\``, inline: true },
			);
			await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'add') {
			if (ctx.userEntity.keys < 1) {
				await ctx.embedify('warn', 'user', 'You do not have any keys.').send(true);
			} else if (ctx.guildEntity.modules.find((m) => m === moduleName)) {
				await ctx.embedify('warn', 'user', `This server already has the \`${moduleName}\` module enabled.`).send(true);
			} else {
				await Module.create({ user: ctx.userEntity, guild: ctx.guildEntity, module: moduleName }).save();
				ctx.userEntity.keys -= 1;
				await ctx.userEntity.save();
				ctx.guildEntity.modules.push(moduleName);
				await ctx.guildEntity.save();
				ctx.client.commands
					.filter((command) => command.data.module === moduleName)
					.forEach(async (command) => {
						await ctx.interaction.guild.commands.create(command.data.toJSON() as any);
					});
				await ctx.embedify('success', 'user', `Added the \`${moduleName}\` module.`).send(true);
			}
		} else if (subcommand === 'remove') {
			const module = await Module.findOne({ guild: ctx.guildEntity, module: moduleName });
			if (!module) {
				await ctx.embedify('warn', 'user', 'You have not enabled this module in this server.').send(true);
			} else {
				ctx.guildEntity.modules = ctx.guildEntity.modules.filter((mod) => mod !== module.module);
				await ctx.guildEntity.save();
				ctx.userEntity.keys += 1;
				await ctx.userEntity.save();
				await module.remove();
				const applicationCommands = await ctx.interaction.guild.commands.fetch();
				ctx.client.commands
					.filter((command) => command.data.module === moduleName)
					.forEach(async (command) => {
						const cmd = applicationCommands.find((applicationCommand) => applicationCommand.name === command.data.name);
						await ctx.interaction.guild.commands.delete(cmd);
					});
				await ctx.embedify('success', 'user', `Removed the \`${moduleName}\` module.`).send(true);
			}
		}
	};
}
