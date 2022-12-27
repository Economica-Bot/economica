import { datasource, User } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { Command } from '../structures/commands';

export const Ping = {
	identifier: /^ping$/,
	type: 'chatInput',
	execute: async (interaction) => {
		let now = Date.now();
		await interaction.reply('Pinging...');
		const api = Date.now() - now;
		const ws = interaction.client.ws.ping;
		now = Date.now();
		await datasource.manager.find(User);
		const db = Date.now() - now;
		const content =
			'```ansi\n' +
			`[1;34mGateway Ping [0m: [0;35m${ws}[0mms\n` +
			`[1;34mRest Ping    [0m: [0;35m${api}[0mms\n` +
			`[1;34mDB Ping      [0m: [0;35m${db}[0mms\n` +
			'```';
		const embed = new EmbedBuilder().setTitle('Pong!').setDescription(content);
		await interaction.editReply({ content: null, embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
