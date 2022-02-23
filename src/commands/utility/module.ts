import { UserModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { modulesArr, specialModulesArr } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setModule('UTILITY')
		.setFormat('module <view | add | remove> [module]')
		.setExamples(['module view', 'module add Interval', 'module remove Interval'])
		.setAuthority('ADMINISTRATOR')
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
		const userDocument = await UserModel.findOneAndUpdate(
			{ userId: ctx.interaction.user.id },
			{ userId: ctx.interaction.user.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		const moduleQuery = ctx.interaction.options.getString('module', false);
		const module = specialModulesArr.find((v) => v.toLowerCase() === moduleQuery.toLowerCase());
		if (!module) {
			await ctx.embedify('error', 'user', `Invalid module: \`${module}\``, true);
		} else if (subcommand === 'view') {
			const disModules = modulesArr.filter((v) => !ctx.guildDocument.modules.includes(v)).join('`, `');
			const embed = ctx.embedify('info', 'guild', "View the server's modules").addFields([
				{ name: 'Enabled Modules', value: `\`${ctx.guildDocument.modules.join('`, `')}\``, inline: true },
				{ name: 'Disabled Modules', value: `\`${disModules.length ? disModules : '`None`'}\``, inline: true },
			]);
			await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'add') {
			if (userDocument.keys < 1) {
				await ctx.embedify('warn', 'user', 'You do not have any keys to redeem a module!', true);
			} if (ctx.guildDocument.modules.includes(module)) {
				await ctx.embedify('warn', 'user', `This server already has the \`${module}\` module enabled.`, true);
			} else {
				userDocument.modules.push({ module, guild: ctx.guildDocument._id });
				userDocument.keys -= 1;
				ctx.guildDocument.modules.push(module);
				userDocument.save();
				ctx.guildDocument.save();
				await ctx.embedify('success', 'user', `Added \`${module}\``, true);
			}
		} else if (subcommand === 'remove') {
			const hasModule = userDocument.modules.some((m) => m.module === module
				&& m.guild.toString() === ctx.guildDocument._id.toString());
			if (!hasModule) {
				await ctx.embedify('warn', 'user', 'You have not enabled this module in this server.', true);
			} else {
				userDocument.modules.remove({ module, guild: ctx.guildDocument._id });
				userDocument.keys += 1;
				ctx.guildDocument.modules.splice(ctx.guildDocument.modules.indexOf(module), 1);
				await userDocument.save();
				await ctx.guildDocument.save();
				await ctx.embedify('success', 'user', `Removed \`${module}\``, true);
			}
		}
	};
}
