import { EmbedBuilder } from 'discord.js';
import { Command } from '../structures/commands';

export const Ping = {
	identifier: /^ping$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const now = Date.now();
		await interaction.reply('Pinging...');
		const api = Date.now() - now;
		const ws = interaction.client.ws.ping;
		const content =
			'```ansi\n' +
			`[1;34mGateway Ping [0m: [0;35m${ws}[0mms\n` +
			`[1;34mRest Ping    [0m: [0;35m${api}[0mms\n` +
			'```';
		const embed = new EmbedBuilder().setTitle('Ping!').setDescription(content);
		await interaction.editReply({ content: null, embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
