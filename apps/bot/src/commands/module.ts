import { ModuleString } from '@economica/common';
import { Guild, Member, User } from '@economica/db/entities';
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder
} from 'discord.js';

interface Context {
	interaction: ChatInputCommandInteraction<'cached'>;
	guildEntity: Guild;
	memberEntity: Member;
	userEntity: User;
}

interface Command {
	data: Partial<SlashCommandBuilder>;
	execute: (ctx: Context) => Promise<void> | void;
}

export default class implements Command {
	public data = new SlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View the enabled modules on this server')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add')
				.setDescription('Add a module to this server.')
				.addStringOption((option) =>
					option
						.setName('module')
						.setDescription('Specify a module')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('Remove a module from this server.')
				.addStringOption((option) =>
					option
						.setName('module')
						.setDescription('Specify a module')
						.setRequired(true)
				)
		);

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const moduleName = ctx.interaction.options.getString(
			'module',
			false
		) as ModuleString;
		if (moduleName && !(moduleName in ctx.guildEntity.modules)) {
			throw new Error(`Invalid module: \`${moduleName}\``);
		} else if (subcommand === 'view') {
			const embed = new EmbedBuilder()
				.setAuthor({
					iconURL: ctx.interaction.guild.iconURL() ?? '',
					name: 'Modules'
				})
				.setDescription(`**View ${ctx.interaction.guild}'s Modules!**`)
				.addFields([
					{
						name: 'Default Modules',
						inline: true,
						value: Object.entries(ctx.guildEntity.modules)
							.filter(([, module]) => module.type === 'DEFAULT')
							.map(([module]) => `\`${module}\``)
							.join('\n')
					},
					{
						name: 'Enabled Modules',
						inline: true,
						value: Object.entries(ctx.guildEntity.modules)
							.filter(([, module]) => module.enabled)
							.map(([module]) => `\`${module}\``)
							.join('\n')
					},
					{
						name: 'Disabled Modules',
						inline: true,
						value: Object.entries(ctx.guildEntity.modules)
							.filter(([, module]) => !module.enabled)
							.map(([module]) => `\`${module}\``)
							.join('\n')
					}
				]);
			await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'add') {
			if (ctx.userEntity.keys < 1) {
				throw new Error('You do not have any keys.');
			} else if (ctx.guildEntity.modules[moduleName].enabled) {
				throw new Error(
					`This server already has the \`${moduleName}\` module enabled.`
				);
			} else {
				ctx.userEntity.keys -= 1;
				await ctx.userEntity.save();
				ctx.guildEntity.modules[moduleName].enabled = true;
				ctx.guildEntity.modules[moduleName].user = ctx.userEntity.id;
				await ctx.guildEntity.save();
				// await Promise.all(
				// 	ctx.client.commands
				// 		.filter((command) => command.data.module === moduleName)
				// 		.map(async (command) => {
				// 			await ctx.interaction.guild.commands.create(
				// 				command.data.toJSON()
				// 			);
				// 		})
				// );
				// await syncPermissions(ctx.client, ctx.interaction.guild);
				// await ctx
				// 	.embedify('success', 'user', `Added the \`${moduleName}\` module.`)
				// 	.send(true);
			}
		} else if (subcommand === 'remove') {
			if (ctx.guildEntity.modules[moduleName].user !== ctx.userEntity.id) {
				throw new Error('You have not enabled this module in this server.');
			} else {
				ctx.userEntity.keys += 1;
				await ctx.userEntity.save();
				ctx.guildEntity.modules[moduleName].enabled = false;
				ctx.guildEntity.modules[moduleName].user = null;
				await ctx.guildEntity.save();
				const applicationCommands =
					await ctx.interaction.guild.commands.fetch();
				// ctx.client.commands
				// 	.filter((command) => command.data.module === moduleName)
				// 	.forEach(async (command) => {
				// 		const cmd = applicationCommands.find(
				// 			(applicationCommand) =>
				// 				applicationCommand.name === command.data.name
				// 		);
				// 		if (cmd) await ctx.interaction.guild.commands.delete(cmd);
				// 	});
				// await ctx
				// 	.embedify('success', 'user', `Removed the \`${moduleName}\` module.`)
				// 	.send(true);
			}
		}
	};
}
