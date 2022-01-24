import { APIRole } from "discord-api-types"
import { Guild, Role, RoleResolvable } from "discord.js"
import { Model } from "mongoose"
import { GuildModel } from "../models"
import { AuthLevelTypes, GuildAuthData } from "../structures"

/**
 * Get the authority level of a role in a guild.
 * @param guild - The Guild in which the interaction took place
 * @param role - The Role object or id of the role whose authority level is to be returned
 * @returns currentAuthLevel
 */
export const getAuthLevel = async (guild: Guild, role: RoleResolvable): Promise<AuthLevelTypes> => {
	const { auth } = await GuildModel.findOne({
		guildId: guild.id
	})

	if (!auth)
		return
	if (role instanceof Role)
		role = role.id

	if (auth.mod.find(rId => rId === role))
		return 'mod'
	else if (auth.manager.find(rId => rId === role))
		return 'manager'
	else if (auth.admin.find(rId => rId === role))
		return 'admin'
}

/**
 * Remove a role from an authority level in a guild
 * @param guild - The Guild in which the interaction took place
 * @param role - The Role object or id of the role whose authority level is to be returned
 * @returns guildAuthData
 */
export const removeAuthRole = async (guild: Guild, role: RoleResolvable): Promise<GuildAuthData> => {
	const { auth } = await GuildModel.findOne({
		guildId: guild.id
	})

	const currentAuthLevel = await getAuthLevel(guild, role)

	console.log(currentAuthLevel)

	if (currentAuthLevel) {
		auth[currentAuthLevel].forEach(rId => {
			if (rId == role)
			auth[currentAuthLevel].splice(auth[currentAuthLevel].indexOf(rId), 1)
		})

		await GuildModel.updateOne({
			guildId: guild.id
		}, {
			auth
		})

		return auth
	}
}