import { APIRole } from "discord-api-types"
import { Guild, Role } from "discord.js"
import { Model } from "mongoose"
import { GuildModel } from "../models"
import { GuildAuthData } from "../structures"

/**
 * Get the authority level of a role in a guild.
 * @param guild - The Guild in which the interaction took place
 * @param role - The Role object or id of the role whose authority level is to be returned
 * @returns currentAuthLevel
 */
export const getAuthLevel = async (guild: Guild, role: Role | APIRole | string): Promise<'mod' | 'manager' | 'admin' | void> => {
	const { auth } = await GuildModel.findOne({
		guildID: guild.id
	})

	if (!auth)
		return
	if (role instanceof Role)
		role = role.id

	auth.mod.forEach(rId => {
		if (rId == role)
			return 'mod'
	})
	auth.manager.forEach(rId => {
		if (rId == role)
			return 'manager'
	})
	auth.admin.forEach(rId => {
		if (rId == role)
			return 'admin'
	})

	return
}

/**
 * Remove a role from an authority level in a guild
 * @param guild - The Guild in which the interaction took place
 * @param role - The Role object or id of the role whose authority level is to be returned
 * @returns guildAuthData
 */
export const removeAuthRole = async (guild: Guild, role: Role | APIRole | string): Promise<GuildAuthData> => {
	const { auth } = await GuildModel.findOne({
		guildID: guild.id
	})

	if (auth) {
		if (role instanceof Role)
			role = role.id

		const currentAuthLevel = await getAuthLevel(guild, role)

		if (currentAuthLevel) {
			auth[currentAuthLevel].forEach(rId => {
				if (rId == role)
					auth[currentAuthLevel].splice(auth[currentAuthLevel].indexOf(rId), 1)
			})

			await GuildModel.updateOne({
				guildID: guild.id
			}, {
				$set: {
					auth
				}
			})

			return auth
		}
	}
}