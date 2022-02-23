import { MessageEmbed, TextChannel } from 'discord.js';

import { GuildModel } from '../models/index.js';
import { Economica, Service } from '../structures/index.js';
import { SERVICE_COOLDOWNS, icons } from '../typings/constants.js';

export default class implements Service {
	public service = 'update-bot-log';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_BOT_LOG;
	public execute = async (client: Economica): Promise<void> => {
		const documents = await GuildModel.find();
		documents.forEach(async (document) => {
			const { guildId, botLogId, transactionLogId, infractionLogId, auth } = document;
			if (!botLogId) return;
			const guild = client.guilds.cache.get(guildId);
			const member = guild.members.cache.get(client.user.id);
			const botLog = client.channels.cache.get(botLogId) as TextChannel;
			if (!botLog.permissionsFor(member).has('SEND_MESSAGES') || !botLog.permissionsFor(member).has('EMBED_LINKS')) return;
			const embed = new MessageEmbed().setColor('DARK_AQUA').setTimestamp();
			const warnings: string[] = [];
			const errors: string[] = [];
			if (transactionLogId) {
				const transactionLog = client.channels.cache.get(transactionLogId) as TextChannel;
				if (!transactionLog) {
					errors.push(`Can not find transaction log channel with id \`${transactionLogId}\`.`);
				} else if (!transactionLog.permissionsFor(member).has('SEND_MESSAGES') || !transactionLog.permissionsFor(member).has('EMBED_LINKS')) {
					warnings.push(`Missing permissions in ${transactionLog}`);
				}
			}

			if (infractionLogId) {
				const infractionLog = client.channels.cache.get(infractionLogId) as TextChannel;
				if (!infractionLog) {
					errors.push(`Can not find infraction log channel with id \`${infractionLogId}\`.`);
				} else if (!infractionLog.permissionsFor(member).has('SEND_MESSAGES') || !infractionLog.permissionsFor(member).has('EMBED_LINKS')) {
					warnings.push(`Missing permissions in ${infractionLog}`);
				}
			}

			if (auth) {
				if (!auth.some((r) => r.authority === 'ADMINISTRATOR')) {
					warnings.push('No roles assigned with `ADMINISTRATOR` authority.');
				}
				if (!auth.some((r) => r.authority === 'MANAGER')) {
					warnings.push('No roles assigned with `MANAGER` authority.');
				}
				if (!auth.some((r) => r.authority === 'MODERATOR')) {
					warnings.push('No roles assigned with `MODERATOR` authority.');
				}
			}

			if (warnings.length) embed.addField('Warnings', warnings.join('\n'));
			if (errors.length) embed.addField('Errors', errors.join('\n'));
			embed.setAuthor({ name: 'BOT STATUS UPDATE', iconURL: embed.fields.length ? icons.WARNING : icons.SUCCESS });
			embed.setDescription(`\`${warnings.length + errors.length}\` warnings.`);
			await botLog.send({ embeds: [embed] }).catch();
		});
	};
}
