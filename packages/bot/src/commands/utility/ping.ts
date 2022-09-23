import { EmbedBuilder } from '@discordjs/builders';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { APIChatInputApplicationCommandInteraction, InteractionResponseType } from 'discord-api-types/v10';
import { Router } from 'express';

import { Command, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping pong!')
		.setModule('UTILITY')
		.setFormat('ping');

	public execution: Router = Router()
		.use('/', async (req, res) => {
			const interaction = req.body as APIChatInputApplicationCommandInteraction;
			const ping = Number(DiscordSnowflake.deconstruct(interaction.id).timestamp) - Date.now();
			const dbStart = Date.now();
			await res.locals.client.db.query('');
			const dbPing = Date.now() - dbStart;
			const embed = new EmbedBuilder()
				.setAuthor({ name: 'Ping Pong!' })
				.setDescription(`\`\`\`ansi\n[1;34mRest Ping    [0m: [0;35m${ping}[0mms\n[1;34mDB Ping      [0m: [0;35m${dbPing}[0mms\n\`\`\``);
			res.send({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					embeds: [embed.toJSON()],
				},
			});
		});
}
