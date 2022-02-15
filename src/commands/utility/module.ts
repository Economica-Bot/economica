import { UserModel } from '../../models';
import { modulesArr, specialModulesArr } from '../../models/guilds';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage modules.')
		.setModule('UTILITY')
		.setAuthority('ADMINISTRATOR')
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the enabled modules on this server.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('add')
				.setDescription('Add a module to this server.')
				.addStringOption((option) => option.setName('module').setDescription('Specify a module.').setRequired(true))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('Remove a module from this server.')
				.addStringOption((option) => option.setName('module').setDescription('Specify a module.').setRequired(true))
		);

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const module = ctx.interaction.options.getString('module', false);
		const userDocument = await UserModel.findOneAndUpdate({ userId: ctx.interaction.user.id }, null, {
			upsert: true,
			new: true,
			setDefaultsOnInsert: true,
			runValidators: true,
		});

		if (subcommand === 'view') {
			const disModules = modulesArr.filter((v) => !ctx.guildDocument.modules.includes(v)).join('`, `');
			const embed = ctx.embedify('info', 'guild', "View the server's modules").addFields([
				{
					name: 'Enabled Modules',
					value: `\`${ctx.guildDocument.modules.join('`, `')}\``,
					inline: true,
				},
				{
					name: 'Disabled Modules',
					value: `\`${disModules.length ? disModules : '`None`'}\``,
					inline: true,
				},
			]);

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		const formattedModule = specialModulesArr.find((v) => v.toLowerCase() === module.toLowerCase());
		if (!formattedModule) {
			return await ctx.embedify('error', 'user', `Invalid module: \`${module}\``, true);
		}

		if (subcommand === 'add') {
			const { keys } = userDocument;
			if (keys < 1) {
				return await ctx.embedify('warn', 'user', 'You do not have any keys to redeem a module!', true);
			} else if (ctx.guildDocument.modules.includes(formattedModule)) {
				// prettier-ignore
				return await ctx.embedify('warn', 'user', `This server already has the \`${formattedModule}\` module enabled.`, true);
			} else {
				userDocument.modules.push({ module: formattedModule, guild: ctx.guildDocument._id });
				userDocument.keys -= 1;
				ctx.guildDocument.modules.push(formattedModule);
				userDocument.save();
				ctx.guildDocument.save();
				return ctx.embedify('success', 'user', `Added \`${formattedModule}\``, true);
			}
		} else if (subcommand === 'remove') {
			if (!userDocument.modules.some((mod) => mod.module === formattedModule && mod.guild.toString() === ctx.guildDocument._id.toString())) {
				return ctx.embedify('warn', 'user', `You have not enabled this module in this server.`, true);
			} else {
				userDocument.modules.remove({ module: formattedModule, guild: ctx.guildDocument._id });
				userDocument.keys += 1;
				ctx.guildDocument.modules.splice(ctx.guildDocument.modules.indexOf(formattedModule), 1);
				await userDocument.save();
				await ctx.guildDocument.save();
				return ctx.embedify('success', 'user', `Removed \`${formattedModule}\``, true);
			}
		}
	};
}
