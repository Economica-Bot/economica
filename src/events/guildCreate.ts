import { Guild } from "discord.js";
import EconomicaClient from "../structures/EconomicaClient";

const config = require('../config.json');
import { GuildModel } from "../models/guilds";

export const name = 'guildCreate';

export async function execute(client: EconomicaClient, guild: Guild) {
	const incomeCommands = [];
	for (const incomeCommand in config.commands) {
		if (incomeCommand !== 'default') {
			incomeCommands.push({
				...{ command: incomeCommand },
				...config.commands[incomeCommand],
			});
		}
	}

	const guildSettings = await GuildModel.findOneAndUpdate(
		{
			guildID: guild.id,
		},
		{
			modules: [],
			commands: [],
			incomeCommands,
			permissions: {
				0: [],
				1: [],
				2: [],
				3: [],
			},
			currency: null,
			transactionLogChannel: null,
			infractionLogChannel: null,
		},
		{
			upsert: true,
			new: true,
		}
	);

	return guildSettings;
}
