/* eslint-disable max-classes-per-file */
import { ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, resolveColor } from 'discord.js';

import { Command } from '.';
import { Guild, Member, User } from '../entities';
import { EmbedColors, Footer, ReplyString } from '../typings';

export class Context<T extends ChatInputCommandInteraction<'cached'> | MessageComponentInteraction<'cached'> = ChatInputCommandInteraction<'cached'> | MessageComponentInteraction<'cached'>> {
	public interaction: T;

	public command: Command;

	public userEntity: User;

	public guildEntity: Guild;

	public memberEntity: Member;

	public clientUserEntity: User;

	public clientMemberEntity: Member;

	public constructor(interaction: T) {
		this.interaction = interaction;
	}

	public isChatInput(): this is Context<ChatInputCommandInteraction<'cached'>> {
		return this.interaction.isChatInputCommand();
	}

	public isMessageComponent(): this is Context<MessageComponentInteraction<'cached'>> {
		return this.interaction.isButton() || this.interaction.isSelectMenu();
	}

	public async init(): Promise<this> {
		let commandName: string;
		if (this.interaction.isChatInputCommand()) commandName = this.interaction.commandName;
		else if (this.interaction.isButton()) [commandName] = JSON.parse(this.interaction.customId).key.split('_');
		else if (this.interaction.isSelectMenu()) [commandName] = JSON.parse(this.interaction.values.at(0)).key.split('_');
		const command = this.interaction.client.commands.get(commandName);
		if (!command) throw new Error('There was an error while executing this command.');

		this.command = command;

		if (!this.interaction.inCachedGuild()) return this;

		this.userEntity = (await User.findOne({ where: { id: this.interaction.user.id } }))
			?? (await User.create({ id: this.interaction.user.id }).save());
		this.guildEntity = (await Guild.findOne({ where: { id: this.interaction.guildId } }))
			?? (await Guild.create({ id: this.interaction.guildId }).save());
		this.memberEntity = (await Member.findOne({ where: { user: { id: this.userEntity.id }, guild: { id: this.guildEntity.id } } }))
			?? (await Member.create({ user: this.userEntity, guild: this.guildEntity }).save());
		this.clientUserEntity = (await User.findOne({ where: { id: this.interaction.client.user.id } }))
			?? (await User.create({ id: this.interaction.client.user.id }).save());
		this.clientMemberEntity = (await Member.findOne({ where: { user: { id: this.clientUserEntity.id }, guild: { id: this.guildEntity.id } } }))
			?? (await Member.create({ user: this.clientUserEntity, guild: this.guildEntity }).save());

		return this;
	}

	public embedify(type: ReplyString, footer: Footer, description?: string | null) {
		const embed = new EmbedBuilder().setColor(resolveColor(EmbedColors[type]));
		if (description) embed.setDescription(description);
		if (footer === 'bot') {
			embed.setFooter({
				text: this.interaction.client.user.tag,
				iconURL: this.interaction.client.user.displayAvatarURL(),
			});
		} else if (footer === 'user') {
			embed.setFooter({ text: this.interaction.user.tag, iconURL: this.interaction.user.displayAvatarURL() });
		} else if (footer === 'guild') {
			embed.setFooter({ text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL() });
		} else embed.setFooter(footer);
		return embed;
	}
}
