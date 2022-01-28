import * as Discord from 'discord.js';

import { GuildModel, InfractionModel, MemberModel, TransactionModel } from '../models';
import {
	EconomicaClient,
	EconomyInfo,
	IncomeCommandProperties,
	InfractionString,
	TransactionString,
} from '../structures';

/**
 * Returns a message embed object.
 * @param {Discord.ColorResolvable} color - Embed Color
 * @param {string} title - Embed title
 * @param {URL} icon_url - Embed picture
 * @param {string} [description] - Embed content.
 * @param {string} [footer] - Embed footer.
 * @returns {MessageEmbed} Message embed.
 */
export function embedify(
	color: Discord.ColorResolvable = 'DEFAULT',
	title: string = null,
	icon_url: string = null,
	description: string = null,
	footer: string = null
): Discord.MessageEmbed {
	const embed = new Discord.MessageEmbed().setColor(color);
	if (icon_url) {
		embed.setAuthor({ name: title, iconURL: icon_url });
	} else if (title) embed.setTitle(title);
	if (description) embed.setDescription(description);
	if (footer) embed.setFooter({ text: footer });

	return embed;
}

export function error(
	description: string,
	title: string = 'Input Error'
): Discord.InteractionReplyOptions {
	return {
		embeds: [
			{
				color: 'RED',
				title,
				description,
			},
		],
		ephemeral: true,
	};
}

export function warning(
	description: string,
	title: string = 'Warning'
): Discord.InteractionReplyOptions {
	return {
		embeds: [
			{
				color: 'YELLOW',
				title,
				description,
			},
		],
		ephemeral: true,
	};
}

export function success(
	description: string,
	title: string = 'Success'
): Discord.InteractionReplyOptions {
	return {
		embeds: [
			{
				color: 'GREEN',
				title,
				description,
			},
		],
		ephemeral: false,
	};
}

/**
 * Gets a user's economy information.
 * @param {string} guildId - guild id.
 * @param {string} userId - User id.
 * @returns {Promise<EconomyInfo>} wallet, treasury, total, rank
 */
export async function getEconInfo(guildId: string, userId: string): Promise<EconomyInfo> {
	let rank = 0,
		wallet = 0,
		treasury = 0,
		total = 0,
		found = false;
	const balances = await MemberModel.find({ guildId }).sort({ total: -1 });
	if (balances.length) {
		for (let rankIndex = 0; rankIndex < balances.length; rankIndex++) {
			rank = balances[rankIndex].userId === userId ? rankIndex + 1 : rank++;
		}

		if (balances[rank - 1]) {
			found = true;
			wallet = balances[rank - 1].wallet;
			treasury = balances[rank - 1].treasury;
			total = balances[rank - 1].total;
		}
	}

	if (!found) {
		await MemberModel.create({
			guildId,
			userId,
			wallet,
			treasury,
			total,
		});
	}

	return {
		wallet,
		treasury,
		total,
		rank,
	};
}

/**
 * Changes a user's economy info.
 * @param {EconomicaClient} client - Economica Client.
 * @param {string} guildId - Guild id.
 * @param {string} userId - User id.
 * @param {TransactionString} type - The transaction type.
 * @param {number} wallet - The value to be added to the user's wallet.
 * @param {number} treasury - The value to be added to the user's treasury.
 * @param {number} total - The value to be added to the user's total.
 * @returns {Promise<number>} total.
 */
export async function transaction(
	client: EconomicaClient,
	guildId: string,
	userId: string,
	agentId: string,
	type: TransactionString,
	wallet: number,
	treasury: number,
	total: number
): Promise<number> {
	//Init
	await getEconInfo(guildId, userId);
	const result = await MemberModel.findOneAndUpdate(
		{
			guildId,
			userId,
		},
		{
			$inc: {
				wallet,
				treasury,
				total,
			},
		}
	);

	const transaction = await TransactionModel.create({
		guildId,
		userId,
		agentId,
		type,
		wallet,
		treasury,
		total,
	});

	const guildSetting = await GuildModel.findOne({
		guildId,
	});

	const channelId = guildSetting?.transactionLogChannel;

	if (channelId) {
		const cSymbol = guildSetting.currency;
		const channel = client.channels.cache.get(channelId) as Discord.TextChannel;
		const guild = channel.guild;
		const description = `Transaction for <@!${userId}>\nPerformed by:<@!${agentId}>\nType: \`${type}\``;
		channel.send({
			embeds: [
				embedify('GOLD', `${transaction._id}`, guild.iconURL(), description)
					.addFields([
						{
							name: '__**Wallet**__',
							value: `${cSymbol}${wallet.toLocaleString()}`,
							inline: true,
						},
						{
							name: '__**Treasury**__',
							value: `${cSymbol}${treasury.toLocaleString()}`,
							inline: true,
						},
						{
							name: '__**Total**__',
							value: `${cSymbol}${total.toLocaleString()}`,
							inline: true,
						},
					])
					.setTimestamp(),
			],
		});
	}

	return result.total;
}

/**
 * Record an infraction.
 * @param {EconomicaClient} client - The Client.
 * @param {string} guildId - Guild id.
 * @param {string} userId - User id.
 * @param {string} agentId - Agent/Staff id.
 * @param {string} type - The punishment for the infraction.
 * @param {string} reason - The reason for the punishment.
 * @param {boolean} permanent - Whether the punishment is permanent.
 * @param {boolean} active - Whehther the punishment is active.
 * @param {number} length - The length of the punishment.
 */
export async function infraction(
	client: Discord.Client,
	guildId: string,
	userId: string,
	agentId: string,
	type: InfractionString,
	reason: string,
	permanent?: boolean,
	active?: boolean,
	duration?: number
) {
	const infraction = await InfractionModel.create({
		guildId,
		userId,
		agentId,
		type,
		reason,
		permanent,
		active,
		duration,
	});

	const guildSetting = await GuildModel.findOne({
		guildId: `${guildId}`,
	});

	const channelId = guildSetting?.infractionLogChannel;

	if (channelId) {
		const channel = client.channels.cache.get(channelId) as Discord.TextChannel;
		const guild = channel.guild;
		const description = `Infraction for <@!${userId}> | Executed by <@!${agentId}>\nType: \`${type}\`\n${reason}`;
		channel.send({
			embeds: [embedify('RED', `${infraction._id}`, guild.iconURL(), description).setTimestamp()],
		});
	}
}

/**
 * Updates the min and max payout for the specified income command
 * @param {String} guildId - Guild id.
 * @param {String} command - Income command.
 * @param {IncomeCommandProperties} properties - Command properties.
 */
export async function setCommandStats(guildId: string, properties: IncomeCommandProperties) {
	await GuildModel.findOneAndUpdate(
		{ guildId },
		{
			$pull: {
				commands: {
					command: properties.command,
				},
			},
		},
		{
			upsert: true,
		}
	);

	await GuildModel.findOneAndUpdate(
		{ guildId },
		{
			$push: {
				commands: {
					...properties,
				},
			},
		},
		{
			upsert: true,
		}
	);
}

/**
 * cuts a string if longer than n and appends '...' to the end.
 * @param {string} str - the string to cut
 * @param {number} n - the size which a string must exceed to be cut
 * @param {boolean} rev - whether the string should be cut in reverse (trim the front excess off)
 * @returns {string} `str.substr(0, rev? -n : n)`
 */
export function cut(str: string, n = 50, rev = false) {
	return str.length <= n ? str.substring(0, rev ? -n : n) : `${str.substring(0, rev ? -n : n)}...`;
}

/**
 * Format numbers!
 * @param {number} num - number to format
 * @returns {string} formatted number
 */
export function num(num: number) {
	let pow10 = 1;
	let degree = null;

	if (num / 1000000000000 >= 1) {
		pow10 = 12;
		degree = 'T';
	} else if (num / 1000000000 >= 1) {
		pow10 = 9;
		degree = 'B';
	} else if (num / 1000000 >= 1) {
		pow10 = 6;
		degree = 'M';
	} else if (num / 1000 >= 1) {
		pow10 = 3;
		degree = 'K';
	}

	if (degree) {
		return `${(num / Math.pow(10, pow10)).toFixed(2)}${degree}`;
	} else return num; // string
}

/**
 * Initiates a pagination embed display.
 * @param {Discord.CommandInteraction} interaction
 * @param {[Discord.MessageEmbed]} embeds
 * @param {number} index
 */
export async function paginate(
	interaction: Discord.CommandInteraction,
	embeds: Discord.MessageEmbed[],
	index: number = 0
) {
	if (!interaction.deferred) {
		await interaction.deferReply();
	}

	if (index > embeds.length - 1) {
		interaction.editReply(error('Page number out of bounds!'));
		return;
	}

	const time = 1000 * 15; //15 second on buttons
	let row = new Discord.MessageActionRow()
		.addComponents(
			new Discord.MessageButton()
				.setCustomId('previous_page')
				.setLabel('Previous')
				.setStyle('SECONDARY')
				.setDisabled(index == 0 ? true : false)
		)
		.addComponents(
			new Discord.MessageButton()
				.setCustomId('next_page')
				.setLabel('Next')
				.setStyle('PRIMARY')
				.setDisabled(index == embeds.length - 1 ? true : false)
		);

	const msg = (await interaction.editReply({
		embeds: [embeds[index]],
		components: [row],
	})) as Discord.Message;

	const filter = (i: Discord.ButtonInteraction): boolean => {
		return i.user.id === interaction.user.id;
	};

	const collector = msg.createMessageComponentCollector<'BUTTON'>({
		filter,
		time,
	});

	collector.on('collect', async (i) => {
		if (index < embeds.length - 1 && index >= 0 && i.customId === 'next_page') {
			index++;
			row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('previous_page')
						.setLabel('Previous')
						.setStyle('SECONDARY')
						.setDisabled(index == 0 ? true : false)
				)
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('next_page')
						.setLabel('Next')
						.setStyle('PRIMARY')
						.setDisabled(index == embeds.length - 1 ? true : false)
				);
		} else if (index > 0 && index < embeds.length && i.customId === 'previous_page') {
			index--;
			row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('previous_page')
						.setLabel('Previous')
						.setStyle('SECONDARY')
						.setDisabled(index == 0 ? true : false)
				)
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('next_page')
						.setLabel('Next')
						.setStyle('PRIMARY')
						.setDisabled(index == embeds.length - 1 ? true : false)
				);
		}

		await i.update({
			embeds: [embeds[index]],
			components: [row],
		});
	});

	collector.on('end', async () => {
		await msg.edit({
			components: [],
		});
	});
}
