import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SelectMenuBuilder } from '@discordjs/builders';
import {
	APIEmbedField,
	APIInteractionResponseChannelMessageWithSource,
	APISelectMenuOption,
	ButtonStyle,
	InteractionResponseType,
	PermissionFlagsBits,
} from 'discord-api-types/v10';
import { Router } from 'express';

import { Command, EconomicaSlashCommandBuilder } from '../../structures';
import { ModuleString } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setModule('UTILITY')
		.setFormat('module <view | add | remove> [module]')
		.setExamples(['module view', 'module add Interval', 'module remove Interval'])
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	public execution = Router()
		.use('/', (req, res) => {
			const embed = new EmbedBuilder()
				.setTitle('Module Configuration Menu')
				.setDescription('Enable or disable modules on this server')
				.setFields(
					...Object
						.entries(req.ctx.guildEntity.modules)
						.filter(([, module]) => module.type === 'SPECIAL')
						.map(([name, module]) => ({ name, value: `\`${module.enabled ? 'ENABLED' : 'DISABLED'}\`\nType: \`${module.type}\`` } as APIEmbedField)),
				);
			const row = new ActionRowBuilder<SelectMenuBuilder>()
				.setComponents(
					new SelectMenuBuilder()
						.setCustomId('/')
						.setOptions([
							...Object
								.entries(req.ctx.guildEntity.modules)
								.filter(([, module]) => module.type === 'SPECIAL')
								.map(([name, module]) => ({ label: name, description: `\`${module.enabled ? 'ENABLED' : 'DISABLED'}\`\nType: \`${module.type}\``, value: `/${name}` } as APISelectMenuOption)),
						]),
				);
			res.send(({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: { embeds: [embed], components: [row.toJSON()] },
			} as APIInteractionResponseChannelMessageWithSource));
		})
		.use('/:module', (req, res) => {
			const module = req.params.module as ModuleString;
			const moduleOb = req.ctx.guildEntity.modules[module];
			const embed = new EmbedBuilder()
				.setTitle(module)
				.setDescription(`\`${moduleOb.enabled ? 'ENABLED' : 'DISABLED'}\`\nType: \`${moduleOb.type}\``);
			const row = new ActionRowBuilder<ButtonBuilder>()
				.setComponents(
					req.ctx.guildEntity.modules[module].enabled
						? new ButtonBuilder()
							.setCustomId(`${req.path}/disable`)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Primary)
						: new ButtonBuilder()
							.setCustomId(`${req.path}/enable`)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId(req.path)
						.setLabel('Back')
						.setStyle(ButtonStyle.Secondary),
				);
			res.send(({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: { embeds: [embed], components: [row.toJSON()] },
			} as APIInteractionResponseChannelMessageWithSource));
		});
}
