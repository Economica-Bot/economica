/* eslint-disable max-classes-per-file */
import {
	APIChatInputApplicationCommandInteraction,
	APIMessageComponentInteraction
} from 'discord-api-types/v10';

import { Economica } from '.';
import { Guild, Member, User } from '../entities';

export class Context<
	T extends
		| APIChatInputApplicationCommandInteraction
		| APIMessageComponentInteraction = APIChatInputApplicationCommandInteraction
> {
	public interaction: T;

	public client: Economica;

	public userEntity!: User;

	public guildEntity!: Guild;

	public memberEntity!: Member;

	public clientUserEntity!: User;

	public clientMemberEntity!: Member;

	public constructor(interaction: T, client: Economica) {
		this.interaction = interaction;
		this.client = client;
	}
}
