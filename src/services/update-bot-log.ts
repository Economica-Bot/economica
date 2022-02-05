import { MessageEmbed, TextChannel } from 'discord.js';

import { icons, SERVICE_COOLDOWNS } from '../config';
import { GuildModel } from '../models';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	public name = 'update-bot-log';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_BOT_LOG;
	public execute = async (client: EconomicaClient): Promise<void> => {
		const documents = await GuildModel.find();
		for (const document of documents) {
			const { guildId, botLogChannelId, transactionLogChannelId, infractionLogChannelId, auth } = document;
			if (!botLogChannelId) return;
			const guild = client.guilds.cache.get(guildId);
			const member = guild.members.cache.get(client.user.id);
			const botLogChannel = client.channels.cache.get(botLogChannelId) as TextChannel;
			if (
				!botLogChannel.permissionsFor(member).has('SEND_MESSAGES') ||
				!botLogChannel.permissionsFor(member).has('EMBED_LINKS')
			) {
				continue;
			}

			const embed = new MessageEmbed().setColor('DARK_AQUA').setTimestamp();

			const warnings: string[] = [];
			const errors: string[] = [];
			const insights: string[] = [];

			if (transactionLogChannelId) {
				const transactionLogChannel = client.channels.cache.get(transactionLogChannelId) as TextChannel;
				if (!transactionLogChannel) {
					errors.push(`Can not find transaction log channel with id \`${transactionLogChannelId}\`.`);
				}
				if (
					!transactionLogChannel.permissionsFor(member).has('SEND_MESSAGES') ||
					!transactionLogChannel.permissionsFor(member).has('EMBED_LINKS')
				) {
					warnings.push(`Missing permissions in ${transactionLogChannel}`);
				}
			}

			if (infractionLogChannelId) {
				const infractionLogChannel = client.channels.cache.get(infractionLogChannelId) as TextChannel;
				if (!infractionLogChannel) {
					errors.push(`Can not find infraction log channel with id \`${infractionLogChannelId}\`.`);
				} else if (
					!infractionLogChannel.permissionsFor(member).has('SEND_MESSAGES') ||
					!infractionLogChannel.permissionsFor(member).has('EMBED_LINKS')
				) {
					warnings.push(`Missing permissions in ${infractionLogChannel}`);
				}
			}

			if (auth) {
				if (!auth.some((r) => r.authority === 'ADMINISTRATOR')) {
					warnings.push(`No roles assigned with \`ADMINISTRATOR\` authority.`);
				}
				if (!auth.some((r) => r.authority === 'MANAGER')) {
					warnings.push(`No roles assigned with \`MANAGER\` authority.`);
				}
				if (!auth.some((r) => r.authority === 'MODERATOR')) {
					warnings.push(`No roles assigned with \`MODERATOR\` authority.`);
				}
			}

			if (warnings.length) {
				embed.addField('Warnings', warnings.join('\n'));
			}
			if (errors.length) {
				embed.addField('Errors', errors.join('\n'));
			}

			embed.setAuthor({ name: 'BOT STATUS UPDATE', iconURL: embed.fields.length ? icons.warning : icons.success });
			embed.setDescription(`\`${warnings.length + errors.length}\` warnings.`);

			await botLogChannel.send({ embeds: [embed] }).catch();
		}
	};
}
