/* eslint-disable max-classes-per-file */
import {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteraction,
	APIMessageApplicationCommandInteraction,
} from 'discord-api-types/v10';

import { Command, Economica } from '.';
import { Guild, Member, User } from '../entities';

export class Context<T extends APIApplicationCommandInteraction | APIMessageApplicationCommandInteraction = APIChatInputApplicationCommandInteraction> {
	public interaction: T;

	public client: Economica;

	public command: Command;

	public userEntity: User;

	public guildEntity: Guild;

	public memberEntity: Member;

	public clientUserEntity: User;

	public clientMemberEntity: Member;

	public constructor(interaction: T, client: Economica) {
		this.interaction = interaction;
		this.client = client;
	}

	public async init(): Promise<this> {
		const command = this.client.commands.get(this.interaction.data.name);
		if (!command) throw new Error('There was an error while executing this command.');

		this.command = command;

		this.userEntity = (await User.findOne({ where: { id: this.interaction.member.user.id } }))
			?? (await User.create({ id: this.interaction.member.user.id }).save());
		this.guildEntity = (await Guild.findOne({ where: { id: this.interaction.guild_id } }))
			?? (await Guild.create({ id: this.interaction.guild_id }).save());
		this.memberEntity = (await Member.findOne({ where: { user: { id: this.userEntity.id }, guild: { id: this.guildEntity.id } } }))
			?? (await Member.create({ user: this.userEntity, guild: this.guildEntity }).save());
		this.clientUserEntity = (await User.findOne({ where: { id: this.interaction.application_id } }))
			?? (await User.create({ id: this.interaction.application_id }).save());
		this.clientMemberEntity = (await Member.findOne({ where: { user: { id: this.clientUserEntity.id }, guild: { id: this.guildEntity.id } } }))
			?? (await Member.create({ user: this.clientUserEntity, guild: this.guildEntity }).save());

		return this;
	}
}
