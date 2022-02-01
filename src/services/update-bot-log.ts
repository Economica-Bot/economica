import { MessageEmbed, TextChannel } from 'discord.js';

import { icons, SERVICE_COOLDOWNS } from '../config';
import { GuildModel } from '../models';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'update-bot-log';
	cooldown = SERVICE_COOLDOWNS.UPDATE_BOT_LOG;
	execute = async (client: EconomicaClient): Promise<void> => {
		const documents = await GuildModel.find();
		documents.forEach(async (document) => {
			const { guildId, botLogChannelId, transactionLogChannelId, infractionLogChannelId, auth } = document;
			if (!botLogChannelId) return;
			const guild = client.guilds.cache.get(guildId);
			const member = guild.members.cache.get(client.user.id);
			const botLogChannel = client.channels.cache.get(botLogChannelId) as TextChannel;
			if (!botLogChannel.permissionsFor(member).has('SEND_MESSAGES')) return;
			const embed = new MessageEmbed()
				.setColor('DARK_AQUA')
				.setAuthor({ name: 'BOT STATUS UPDATE', iconURL: icons.info })
				.setTimestamp();

			const warnings: string[] = [];
			const errors: string[] = [];
			const insights: string[] = [];

			if (transactionLogChannelId) {
				const transactionLogChannel = client.channels.cache.get(transactionLogChannelId) as TextChannel;
				if (!transactionLogChannel) {
					errors.push(`Can not find transaction log channel with id \`${transactionLogChannelId}\`.`);
				}
				if (!transactionLogChannel.permissionsFor(member).has('SEND_MESSAGES')) {
					warnings.push(`Missing permissions in ${transactionLogChannel}`);
				}
			}

			if (infractionLogChannelId) {
				const infractionLogChannel = client.channels.cache.get(infractionLogChannelId) as TextChannel;
				if (!infractionLogChannel) {
					errors.push(`Can not find infraction log channel with id \`${infractionLogChannelId}\`.`);
				} else if (!infractionLogChannel.permissionsFor(member).has('SEND_MESSAGES')) {
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
			if (insights.length) {
				embed.addField('Insights', insights.join('\n'));
			}

			await botLogChannel.send({ embeds: [embed] });
		});
	};
}
