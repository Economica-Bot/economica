import { CommandInteraction, MessageEmbed, Role } from 'discord.js';
import { GuildModel } from '../../models/';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	Context,
	AuthLevelTypes
} from '../../structures';
import {
	getAuthLevel,
	authors,
	hyperlinks,
	removeAuthRole
} from '../../util'

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('authority')
		.setDescription('Interact with the economy-permission roles')
		.setGroup('utility')
		.setFormat('<view | set | reset> [...options]')
		.addEconomicaSubcommand(options =>
			options
				.setName('view')
				.setDescription('View the economy authority of roles.')
		)
		.addEconomicaSubcommand(options =>
			options
				.setName('set')
				.setDescription('Add a role to a specific authority level')
				.setFormat('<role> <user | mod | manager | admin>')
				.addRoleOption(option =>
					option
						.setName('role')
						.setDescription('The target role to grant authority to.')
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('level')
						.setDescription('The level of authority to be given to \`role\`')
						.setRequired(true)
						.addChoices([['User', 0], ['Mod', 1], ['Economy Manager', 2], ['Admin', 3]])
				)
		)
		.addEconomicaSubcommand(options =>
			options
				.setName('reset')
				.setDescription('Reset all guild authority settings to Economica defaults')
				.addNumberOption(option =>
					option
						.setName('confirm')
						.setDescription('This action cannot be undone.')
						.addChoice('Yes, reset all authorities.', 0)
						.addChoice('No, keep authorities as-is.', 1)
						.setRequired(true)
				)
		)

	execute = async ({ interaction }: Context) => {
		const subcommand = interaction.options.getSubcommand()

		if (subcommand == 'view') {
			// Get the auth roles from db
			const { auth } = await GuildModel.findOne({
				guildId: interaction.guildId
			})

			const modRoles: string[] = []
			auth?.mod.forEach(r => {
				modRoles.push(interaction.guild.roles.cache.get(r).name)
			})

			const managerRoles: string[] = []
			auth?.manager.forEach(r => {
				managerRoles.push(interaction.guild.roles.cache.get(r).name)
			})

			const adminRoles: string[] = []
			auth?.admin.forEach(r => {
				adminRoles.push(interaction.guild.roles.cache.get(r).name)
			})

			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({
							name: `${interaction.guild.name} Economy Authority Hierarchy`,
							iconURL: interaction.guild.iconURL()
						})
						.setDescription('Running a server economy on your own is no easy task. Build and customize your economy team with Economica\'s authority utility!')
						.addField('__Economy Mod__', 'Keep your economy safe and cheater-free!')
						.addField('Description', `Economy mods can manage the economy blacklists (economy blacklist, loans blacklist, etc...)\n`, true)
						.addField('Roles', `${modRoles.length ? `\`${modRoles.join('`, `')}\`\n` : 'No Authorized Roles\n'}`, true)
						.addField('__Economy Manager__', 'Update your economy with fresh new content!')
						.addField('Description', `Economy managers can manage the economy as a whole (shop, users, inventories, etc...). They also have all the permissions of Economy Mods.\n`, true)
						.addField('Roles', `${managerRoles.length ? `\`${managerRoles.join('`, \`')}\`` : 'No Authorized roles\n*Note: Any user with a role called `Economy Manager` (caps insensitive) is automatically considered an economy manager.\n'}`, true)
						.addField('__Economy Admin__', 'Lead your economy team!')
						.addField('Description', `Economy Admins can do anything with regards to the economy (reset economy, manage economy ranks and permissions, etc...)\n`, true)
						.addField('Roles', `${adminRoles.length ? `\`${adminRoles.join('`, `')}\`` : 'No Authorized Roles\n*Note: Any user with the `ADMINISTRATOR` permission is automatically considered an Economy Admin.\n'}`, true)
				]
			})
		} else if (subcommand == 'set') {
			const setAuthInt = interaction.options.getInteger('level')
			const targetRole = interaction.options.getRole('role') as Role

			const currentAuthLevel = await getAuthLevel(interaction.guild, targetRole)
			console.log(currentAuthLevel)

			let { auth } = await GuildModel.findOne({
				guildId: interaction.guild.id
			})

			// Return this role's authority to base state (e.g remove it from guild authority)
			if (!setAuthInt) {
				if (!currentAuthLevel) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor('YELLOW')
								.setAuthor(authors.warning)
								.setTitle('Utility:authority set')
								.setDescription(`Role \`${targetRole.name}\` didn't have any authority to begin with!\n\n${hyperlinks.insertAll()}`)
						]
					})
				} else {
					await removeAuthRole(interaction.guild, targetRole)

					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor('GREEN')
								.setAuthor(authors.success)
								.setTitle('Utility:authority set')
								.setDescription(`Role \`${targetRole.name}\` has been set to \`User\` authority (stripped of authority).\n\n${hyperlinks.insertAll()}`)
						]
					})
				}
			} else {
				// Map integer auth value to string auth level
				const setAuthLevel: AuthLevelTypes = {
					1: 'mod' as AuthLevelTypes,
					2: 'manager' as AuthLevelTypes,
					3: 'admin' as AuthLevelTypes
				}[setAuthInt]

				if (currentAuthLevel == setAuthLevel) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor('YELLOW')
								.setAuthor(authors.warning)
								.setTitle('Utility:authority set')
								.setDescription(`Role \`${targetRole.name}\` already has authority \`${setAuthLevel[0].toUpperCase() + setAuthLevel.substring(1)}\`\n\n${hyperlinks.insertAll()}`)
						]
					})
				} else {
					if (currentAuthLevel) {
						await removeAuthRole(interaction.guild, targetRole)
					}

					auth = (await GuildModel.findOne({
						guildId: interaction.guild.id
					})).auth

					if (auth) {
						if (!auth[setAuthLevel].includes(targetRole.id))
							auth[setAuthLevel].push(targetRole.id)
					} else {
						auth = {
							mod: [],
							manager: [],
							admin: []
						}
						auth[setAuthLevel].push(targetRole.id)
					}

					await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor('GREEN')
								.setAuthor(authors.success)
								.setTitle('Utility:authority set')
								.setDescription(`Role \`${targetRole.name}\` has been set to \`${setAuthLevel[0].toUpperCase() + setAuthLevel.substring(1)}\` from \`${currentAuthLevel}\`.\n\n${hyperlinks.insertAll()}`)
						]
					})

					return await GuildModel.updateOne({
						guildId: interaction.guildId
					}, {
						$set: {
							auth
						}
					})
				}
			}
		}
	}
}