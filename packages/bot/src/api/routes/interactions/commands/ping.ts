import { EmbedBuilder } from '@discordjs/builders';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { InteractionResponseType } from 'discord-api-types/v10';
import { Router } from 'express';

export default Router()
	.use('/', async (req, res) => {
		const ping = Date.now() - Number(DiscordSnowflake.deconstruct(req.body.id).timestamp);
		const dbStart = Date.now();
		await req.ctx.client.db.query('');
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
