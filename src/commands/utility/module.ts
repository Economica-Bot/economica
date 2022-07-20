import { PermissionFlagsBits, SelectMenuInteraction } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setModule('UTILITY')
		.setFormat('module <view | add | remove> [module]')
		.setExamples(['module view', 'module add Interval', 'module remove Interval'])
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	public execute = new ExecutionBuilder()
		.setName('Module Configuration Menu')
		.setValue('module')
		.setDescription('Manage server modules')
		.setPagination(
			(ctx) => Object.entries(ctx.guildEntity.modules),
			([name, module]) => new ExecutionBuilder()
				.setName(name)
				.setValue(name)
				.setDescription(`\`${module.enabled ? 'ENABLED' : 'DISABLED'}\`\nType: \`${module.type}\``)
				.setOptions(
					module.type !== 'DEFAULT'
						? [
							new ExecutionBuilder()
								.setName(module.enabled ? 'Disable' : 'Enable')
								.setValue(module.enabled ? 'disable' : 'enable')
								.setDescription(`${module.enabled ? 'Disable' : 'Enable'} the \`${name}\` module`)
								.setExecution(async (ctx, interaction) => {
									await interaction.deferReply();
									const operation = (interaction as SelectMenuInteraction).values[0];
									if (operation === 'enable') {
										if (ctx.userEntity.keys < 1) {
											const embed = ctx.embedify('warn', 'user', 'You do not have any keys.');
											await interaction.editReply({ embeds: [embed], components: [] });
										} else if (ctx.guildEntity.modules[name].enabled) {
											const embed = ctx.embedify(
												'warn',
												'user',
												`This server already has the \`${name}\` module enabled.`,
											);
											await interaction.editReply({ embeds: [embed], components: [] });
										} else {
											ctx.userEntity.keys -= 1;
											await ctx.userEntity.save();
											ctx.guildEntity.modules[name].enabled = true;
											ctx.guildEntity.modules[name].user = ctx.userEntity.id;
											await ctx.guildEntity.save();
											await Promise.all(
												ctx.client.commands
													.filter((command) => command.data.module === name)
													.map(async (command) => {
														await ctx.interaction.guild.commands.create(command.data.toJSON());
													}),
											);
											const embed = ctx.embedify('success', 'user', `Added the \`${name}\` module.`);
											interaction.editReply({ embeds: [embed], components: [] });
										}
									} else if (operation === 'disable') {
										if (ctx.guildEntity.modules[name].user !== ctx.userEntity.id) {
											const embed = ctx.embedify(
												'warn',
												'user',
												'You have not enabled this module in this server.',
											);
											await interaction.update({ embeds: [embed], components: [] });
										} else {
											ctx.userEntity.keys += 1;
											await ctx.userEntity.save();
											ctx.guildEntity.modules[name].enabled = false;
											ctx.guildEntity.modules[name].user = null;
											await ctx.guildEntity.save();
											const applicationCommands = await ctx.interaction.guild.commands.fetch();
											ctx.client.commands
												.filter((command) => command.data.module === name)
												.forEach(async (command) => {
													const cmd = applicationCommands.find(
														(applicationCommand) => applicationCommand.name === command.data.name,
													);
													if (cmd) await ctx.interaction.guild.commands.delete(cmd);
												});
											const embed = ctx.embedify('success', 'user', `Removed the \`${name}\` module.`);
											await interaction.editReply({ embeds: [embed], components: [] });
										}
									}
								}),
						]
						: [],
				),
		);
}
