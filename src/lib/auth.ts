import { Guild, Role, RoleResolvable } from 'discord.js';

import { GuildModel } from '../models';
import { Authority, RoleAuthority } from '../typings';

/**
 * Get the authority level of a role in a guild.
 * @param {Guild} - The Guild in which the interaction took place
 * @param {Role} - The Role object or id of the role whose authority level is to be returned
 * @returns currentAuthLevel
 */
export const getAuthLevel = async (guild: Guild, role: RoleResolvable): Promise<Authority> | null => {
	const { auth } = await GuildModel.findOne({
		guildId: guild.id,
	});

	if (role instanceof Role) role = role.id;
	return auth.find((r) => r.roleId === role).authority ?? null;
};

/**
 * Remove a role from an authority level in a guild
 * @param {Guild} - The Guild in which the interaction took place
 * @param {Role} - The Role object or id of the role whose authority level is to be returned
 * @returns {RoleAuthority[]}
 */
export const removeAuthRole = async (guild: Guild, role: RoleResolvable): Promise<RoleAuthority[]> => {
	if (role instanceof Role) role = role.id;
	const guildDocument = await GuildModel.findOne({
		guildId: guild.id,
	});
	await guildDocument.updateOne({ $pull: { auth: { roleId: role } } });
	return guildDocument.auth;
};

/**
 * Set or update a role's authority.
 * @param {Guild} guild
 * @param {Role}  role
 * @param {Authority} auth
 * @returns {Promise<RoleAuthority>}
 */
export const setAuthRole = async (guild: Guild, role: RoleResolvable, auth: Authority): Promise<RoleAuthority> => {
	if (role instanceof Role) role = role.id;
	const authority: RoleAuthority = { roleId: role, authority: auth };
	const guildDocument = await GuildModel.findOne({ guildId: guild.id });
	await guildDocument.updateOne({ $push: { auth: authority } });
	return authority;
};
