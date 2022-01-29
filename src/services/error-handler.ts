import { CommandInteraction, WebhookClient } from 'discord.js';

import { DEBUG, DISCORD_INVITE_URL, PUBLIC_GUILD_ID, WEBHOOK_URLS } from '../config';
import { embedify } from '../lib';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'error-handler';
	webhookClients: WebhookClient[] = [];
	execute = async (client: EconomicaClient) => {
		console.log(`Executing service ${this.name}`);
		WEBHOOK_URLS.forEach((WEBHOOK_URL) => {
			this.webhookClients.push(new WebhookClient({ url: WEBHOOK_URL }));
		});

		client.on('error', async (err) => await this.error(err));
		client.on('warn', async (message) => await this.error(message));
		client.on('invalidRequestWarning', async (message) => await this.error(message));

		process.on('unhandledRejection', async (err) => await this.error(err));
		process.on('uncaughtException', async (err) => await this.error(err));
		process.on('rejectionHandled', async (err) => await this.error(err));
	};

	error = async (error: any, interaction?: CommandInteraction) => {
		let message, title;
		if (error instanceof Error) {
			title = error.name;
			message = error.message;
		} else if (typeof error === 'string') {
			title = 'Warning';
			message = error;
		} else {
			title = 'Invalid Request Warning';
			message = error;
		}

		if (interaction) {
			const guild = interaction.client.guilds.cache.get(PUBLIC_GUILD_ID);
			const title = interaction.user.tag;
			const icon_url = interaction.user.displayAvatarURL();
			const description = `**Command**: \`${interaction.commandName}\`\n\`\`\`ts\n${message}\`\`\`
        You've encountered an error.
        Report this in [${guild.name}](${DISCORD_INVITE_URL}).`;
			const embed = embedify('RED', title, icon_url, description);
			if (interaction.replied) {
				await interaction.followUp({ embeds: [embed], ephemeral: true });
			} else if (interaction.deferred) {
				await interaction.editReply({ embeds: [embed] });
			} else {
				await interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}

		if (DEBUG) {
			const embed = embedify('RED', title, null, `\`\`\`js\n${message}\`\`\``);
			this.webhookClients.forEach((webhookClient) => webhookClient.send({ embeds: [embed] }));
		}
	};
}
