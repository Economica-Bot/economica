import { Message } from 'discord.js';

import { UserModel } from '../../models';
import { defaultModulesArr, modulesArr } from '../../models/guilds';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { UserModule } from '../../typings/interfaces';

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

	public execute = async (ctx: Context): Promise<Message | void> => {
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
				{ name: 'Enabled Modules', value: `\`${ctx.guildDocument.modules.join('`, `')}\``, inline: true },
				{
					name: 'Disabled Modules',
					value: `\`${disModules.length ? disModules : '`None`'}\``,
					inline: true,
				},
			]);

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		const formattedModule = modulesArr.find((v) => v.toLowerCase() === module.toLowerCase());
		if (!formattedModule) {
			return await ctx.embedify('error', 'user', `Invalid module: \`${module}\``, true);
		} else if (defaultModulesArr.some((v) => v === formattedModule)) {
			return await ctx.embedify('warn', 'user', 'That is a default module.', true);
		}
		if (subcommand === 'add') {
			const { keys } = userDocument;
			if (keys < 1) {
				return await ctx.embedify('warn', 'user', 'You do not have any keys to redeem a module!', true);
			} else if (ctx.guildDocument.modules.includes(formattedModule)) {
				return await ctx.embedify(
					'warn',
					'user',
					`This server already has the \`${formattedModule}\` module enabled.`,
					true
				);
			} else {
				await userDocument.updateOne({
					$push: { modules: { module: formattedModule, guildId: ctx.interaction.guildId } as UserModule },
					$inc: { keys: -1 },
				});
				await ctx.guildDocument.updateOne({
					$push: { modules: formattedModule },
				});
				return ctx.embedify('success', 'user', `Added \`${formattedModule}\``, true);
			}
		} else if (subcommand === 'remove') {
			if (
				!userDocument.modules.some((mod) => mod.module === formattedModule && mod.guildId === ctx.interaction.guildId)
			) {
				return ctx.embedify('warn', 'user', `You have not enabled this module in this server.`, true);
			} else {
				await userDocument.updateOne({
					$pull: { modules: { module: formattedModule, guildId: ctx.interaction.guildId } as UserModule },
					$inc: { keys: 1 },
				});
				await ctx.guildDocument.updateOne({
					$pull: { modules: formattedModule },
				});
				return ctx.embedify('success', 'user', `Removed \`${formattedModule}\``, true);
			}
		}
	};
}
