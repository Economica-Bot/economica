import { Guild, GuildMember, GuildMemberResolvable, Message, Role, RoleResolvable, Snowflake, ThreadMember, User } from 'discord.js';

import { Authority, GuildModel } from '../models/index.js';
import { Authorities } from '../typings/index.js';

function parseId(id: RoleResolvable | GuildMemberResolvable): Snowflake {
	if (id instanceof Role) {
		return id.id;
	} if (id instanceof GuildMember) {
		return id.id;
	} if (id instanceof User) {
		return id.id;
	} if (id instanceof ThreadMember) {
		return id.id;
	} if (id instanceof Message) {
		return id.author.id;
	}

	return id;
}

/**
 * Get the authority level of a user/role in a guild.
 * @param {Guild} - The Guild in which the interaction took place
 * @param {Role} - The user/role whose authority level is to be returned
 * @returns {keyof typeof Authorities}
 */
export const getAuth = async (guild: Guild, _id: RoleResolvable | GuildMemberResolvable): Promise<keyof typeof Authorities> | null => {
	const id = parseId(_id);
	const { auth } = await GuildModel.findOne({ guildId: guild.id });
	return auth.find((r) => r.id === id).authority ?? null;
};

/**
 * Remove a user/role from an authority level in a guild
 * @param {Guild} - The Guild in which the interaction took place
 * @param {Role} - The user/role whose authority level is to be returned
 */
export const removeAuth = async (guild: Guild, _id: RoleResolvable | GuildMemberResolvable): Promise<void> => {
	const id = parseId(_id);
	const guildDocument = await GuildModel.findOne({ guildId: guild.id });
	await guildDocument.updateOne({ $pull: { auth: { id } } });
};

/**
 * Set or update a role's authority.
 * @param {Guild} guild
 * @param {Role}  role
 * @param {Authority} auth
 */
export const setAuth = async (guild: Guild, _id: RoleResolvable | GuildMemberResolvable, auth: keyof typeof Authorities): Promise<Authority> => {
	const id = parseId(_id);
	const authority = { id, authority: auth } as Authority;
	const guildDocument = await GuildModel.findOne({ guildId: guild.id });
	await guildDocument.updateOne({ $push: { auth: authority } });
	return authority;
};
