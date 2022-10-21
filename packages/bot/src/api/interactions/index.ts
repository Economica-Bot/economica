import {
	APIChatInputApplicationCommandInteraction,
	APIMessageComponentInteraction,
	ComponentType,
	InteractionType
} from 'discord-api-types/v10';
import express from 'express';

import { PUB_KEY } from '../../config';
import { Guild, Member, User } from '../../entities';
import { Context } from '../../structures';
import addMoney from './commands/add-money';
import invite from './commands/invite';
import modulet from './commands/module';
import ping from './commands/ping';
import purge from './commands/purge';

import nacl from 'tweetnacl';
import { TextEncoder } from 'util';

const router = express
	.Router()
	.use((req, res, next) => {
		const signature = req.header('X-Signature-Ed25519') || '';
		const timestamp = req.header('X-Signature-Timestamp') || '';

		let isVerified;
		try {
			isVerified = nacl.sign.detached.verify(
				Buffer.from(
					new Uint8Array([
						...new TextEncoder().encode(timestamp),
						...new Uint8Array(Buffer.from(JSON.stringify(req.body), 'utf-8'))
					])
				),
				Buffer.from(signature, 'hex'),
				Buffer.from(PUB_KEY, 'hex')
			);
		} catch {}

		if (!isVerified) res.sendStatus(401);
		else next();
	})
	.post('/', async (req, res, next) => {
		const interaction = req.body as
			| APIChatInputApplicationCommandInteraction
			| APIMessageComponentInteraction;
		const ctx = new Context(interaction, res.locals.client);
		ctx.userEntity = await User.save({ id: interaction.member?.user.id });
		ctx.guildEntity = await Guild.save({ id: interaction.guild_id });
		ctx.memberEntity = await Member.save({
			user: { id: ctx.userEntity.id },
			guild: { id: ctx.guildEntity.id }
		});
		ctx.clientUserEntity = await User.save({ id: interaction.application_id });
		ctx.clientMemberEntity = await Member.save({
			user: { id: ctx.clientUserEntity.id },
			guild: { id: ctx.guildEntity.id }
		});
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		req.ctx = ctx;
		if (interaction.type === InteractionType.ApplicationCommand) {
			req.url = `/commands/${interaction.data.name}`;
			next();
		} else if (interaction.type === InteractionType.MessageComponent) {
			if (interaction.data.component_type === ComponentType.Button) {
				req.url = interaction.data.custom_id;
				next();
			} else {
				[req.url] = interaction.data.values;
				next();
			}
		}
	})
	.use('/add-money', addMoney)
	.use('/invite', invite)
	.use('/module', modulet)
	.use('/ping', ping)
	.use('/purge', purge);

export default router;
