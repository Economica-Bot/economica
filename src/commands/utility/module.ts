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
			const description = `**View ${ctx.interaction.guild}'s Modules!**\nModule command authorities must be set manually after they are added to the server.`;
			const embed = ctx
				.embedify('info', 'guild', description)
				.setAuthor({ iconURL: ctx.interaction.guild.iconURL(), name: 'Modules' })
				.addFields(
					{ name: 'Default Modules', inline: true, value: ctx.guildEntity.modules.filter((module) => module.type === 'DEFAULT').map((module) => `\`${module.module}\``).join('\n') },
					{ name: 'Enabled Modules', inline: true, value: ctx.guildEntity.modules.filter((module) => module.type === 'SPECIAL').map((module) => `\`${module.module}\``).join('\n') },
					{ name: 'Disabled Modules', inline: true, value: Object.keys(Modules).filter((module) => !ctx.guildEntity.modules.some((m) => m.module === module)).map((module) => `\`${module}\``).join('\n') },
				);
			await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'add') {
			if (ctx.userEntity.keys < 1) {
				await ctx.embedify('warn', 'user', 'You do not have any keys.').send(true);
			} else if (ctx.guildEntity.modules.some((module) => module.module === moduleName)) {
				await ctx.embedify('warn', 'user', `This server already has the \`${moduleName}\` module enabled.`).send(true);
			} else {
				ctx.userEntity.keys -= 1;
				await ctx.userEntity.save();
				ctx.guildEntity.modules.push({ module: moduleName, type: 'SPECIAL', user: ctx.userEntity.id });
				await ctx.guildEntity.save();
				ctx.client.commands
					.filter((command) => command.data.module === moduleName)
					.forEach(async (command) => {
						await ctx.interaction.guild.commands.create(command.data.toJSON() as any);
					});
				await ctx.embedify('success', 'user', `Added the \`${moduleName}\` module.`).send(true);
			}
		} else if (subcommand === 'remove') {
			if (!ctx.guildEntity.modules.some((module) => module.module === moduleName && module.user === ctx.userEntity.id)) {
				await ctx.embedify('warn', 'user', 'You have not enabled this module in this server.').send(true);
			} else {
				ctx.userEntity.keys += 1;
				await ctx.userEntity.save();
				ctx.guildEntity.modules = ctx.guildEntity.modules.filter((module) => module.module !== moduleName);
				await ctx.guildEntity.save();
				const applicationCommands = await ctx.interaction.guild.commands.fetch();
				ctx.client.commands
					.filter((command) => command.data.module === moduleName)
					.forEach(async (command) => {
						const cmd = applicationCommands.find((applicationCommand) => applicationCommand.name === command.data.name);
						if (cmd) await ctx.interaction.guild.commands.delete(cmd);
					});
				await ctx.embedify('success', 'user', `Removed the \`${moduleName}\` module.`).send(true);
			}
		}
	};
}
