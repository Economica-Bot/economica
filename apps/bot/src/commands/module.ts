import { CommandData, ModuleString } from '@economica/common';
import { datasource, Guild, User } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { Command } from '../structures/commands';

export const Module = {
	identifier: /^module$/,
	type: 'chatInput' as const,
	execute: async ({ interaction, userEntity, guildEntity }) => {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const description = `**View ${interaction.guild}'s Modules!**`;
			const embed = new EmbedBuilder()
				.setAuthor({
					iconURL:
						interaction.guild.iconURL() ?? interaction.user.displayAvatarURL(),
					name: 'Modules'
				})
				.setDescription(description)
				.addFields([
					{
						name: 'Default Modules',
						inline: true,
						value: Object.entries(guildEntity.modules)
							.filter(([, module]) => module.type === 'DEFAULT')
							.map(([module]) => `\`${module}\``)
							.join('\n')
					},
					{
						name: 'Enabled Modules',
						inline: true,
						value: Object.entries(guildEntity.modules)
							.filter(([, module]) => module.enabled)
							.map(([module]) => `\`${module}\``)
							.join('\n')
					},
					{
						name: 'Disabled Modules',
						inline: true,
						value: Object.entries(guildEntity.modules)
							.filter(([, module]) => !module.enabled)
							.map(([module]) => `\`${module}\``)
							.join('\n')
					}
				]);
			await interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'add') {
			const moduleName = interaction.options.getString(
				'module',
				true
			) as ModuleString;
			if (userEntity.keys < 1) {
				throw new Error('You do not have any keys.');
			} else if (guildEntity.modules[moduleName].enabled) {
				throw new Error(
					`This server already has the \`${moduleName}\` module enabled.`
				);
			} else {
				userEntity.keys -= 1;
				await datasource.getRepository(User).save(userEntity);
				guildEntity.modules[moduleName].enabled = true;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				guildEntity.modules[moduleName].user = userEntity.id;
				await datasource.getRepository(Guild).save(guildEntity);
				await Promise.all(
					CommandData.filter((command) => command.module === moduleName).map(
						async (command) => {
							await interaction.guild.commands.create(command);
						}
					)
				);
				const embed = new EmbedBuilder()
					.setAuthor({ name: 'Success!' })
					.setDescription(`Added the \`${moduleName}\` module.`);
				await interaction.reply({ embeds: [embed] });
			}
		} else if (subcommand === 'remove') {
			const moduleName = interaction.options.getString(
				'module',
				true
			) as ModuleString;
			if (guildEntity.modules[moduleName].user !== userEntity.id) {
				throw new Error('You have not enabled this module in this server.');
			} else {
				userEntity.keys += 1;
				await datasource.getRepository(User).save(userEntity);
				guildEntity.modules[moduleName].enabled = false;
				guildEntity.modules[moduleName].user = null;
				await datasource.getRepository(Guild).save(guildEntity);
				const applicationCommands = await interaction.guild.commands.fetch();
				CommandData.filter((command) => command.module === moduleName).forEach(
					async (command) => {
						const cmd = applicationCommands.find(
							(applicationCommand) => applicationCommand.name === command.name
						);
						if (cmd) await interaction.guild.commands.delete(cmd);
					}
				);
				const embed = new EmbedBuilder()
					.setAuthor({ name: 'Success!' })
					.setDescription(`Removed the \`${moduleName}\` module.`);
				await interaction.reply({ embeds: [embed] });
			}
		}
	}
} satisfies Command<'chatInput'>;
