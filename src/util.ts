const config = require('./config.json');
import * as Discord from 'discord.js';

import { MemberModel } from './models/members';
import { GuildModel } from './models/guilds';
import { InfractionModel } from './models/infractions';
import { LoanModel } from './models/loans';
import { MarketModel } from './models/markets';
import { TransactionModel } from './models/transactions';
import { ShopModel } from './models/shops.js';
import EconomicaClient from './structures/EconomicaClient';
import {
	CommandData,
	EconomyInfo,
	IncomeCommandProperties,
} from './structures/Datatypes';

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
		embed.setAuthor(title).setThumbnail(icon_url);
	} else if (title) embed.setTitle(title);
	if (description) embed.setDescription(description);
	if (footer) embed.setFooter(footer);

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
 * @param {string} guildID - GuildModel id.
 * @param {string} userID - User id.
 * @returns {Promise<EconomyInfo>} wallet, treasury, total, rank
 */
export async function getEconInfo(
	guildID: string,
	userID: string
): Promise<EconomyInfo> {
	let rank = 0,
		wallet = 0,
		treasury = 0,
		total = 0,
		found = false;
	const balances = await MemberModel.find({ guildID }).sort({ total: -1 });
	if (balances.length) {
		for (let rankIndex = 0; rankIndex < balances.length; rankIndex++) {
			rank = balances[rankIndex].userID === userID ? rankIndex + 1 : rank++;
		}

		if (balances[rank - 1]) {
			found = true;
			wallet = balances[rank - 1].wallet;
			treasury = balances[rank - 1].treasury;
			total = balances[rank - 1].total;
		}
	}

	if (!found) {
		await new MemberModel({
			guildID,
			userID,
			wallet,
			treasury,
			total,
		}).save();
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
 * @param {string} guildID - Guild id.
 * @param {string} userID - User id.
 * @param {string} transaction_type - The transaction type.
 * @param {string} memo - The transaction dispatcher.
 * @param {Number} wallet - The value to be added to the user's wallet.
 * @param {Number} treasury - The value to be added to the user's treasury.
 * @param {Number} total - The value to be added to the user's total.
 * @returns {Number} total.
 */
export async function transaction(
	client: Discord.Client,
	guildID: string,
	userID: string,
	transaction_type: string,
	memo: string,
	wallet: Number,
	treasury: Number,
	total: Number
): Promise<Number> {
	//Init
	await this.getEconInfo(guildID, userID);
	const result = await MemberModel.findOneAndUpdate(
		{
			guildID,
			userID,
		},
		{
			$inc: {
				wallet,
				treasury,
				total,
			},
		},
		{
			new: true,
			upsert: true,
		}
	);

	const transaction = await new TransactionModel({
		guildID,
		userID,
		transaction_type,
		memo,
		wallet,
		treasury,
		total,
	}).save();

	const guildSetting = await GuildModel.findOne({
		guildID,
	});

	const channelID = guildSetting?.transactionLogChannel;

	if (channelID) {
		const cSymbol = await this.getCurrencySymbol(guildID);
		const channel = client.channels.cache.get(channelID) as Discord.TextChannel;
		const guild = channel.guild;
		const description = `Transaction for <@!${userID}>\nType: \`${transaction_type}\` | ${memo}`;
		channel.send({
			embeds: [
				this.embedify(
					'GOLD',
					`${transaction._id}`,
					guild.iconURL(),
					description
				)
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
 * @param {String} guildID - GuildModel id.
 * @param {String} userID - User id.
 * @param {String} staffID - Staff id.
 * @param {String} type - The punishment for the infraction.
 * @param {String} reason - The reason for the punishment.
 */
export async function infraction(
	client: Discord.Client,
	guildID: String,
	userID: String,
	staffID: String,
	type: String,
	reason: String,
	permanent: Boolean,
	active: Boolean,
	expires: Date
) {
	const infraction = await new InfractionModel({
		guildID,
		userID,
		staffID,
		type,
		reason,
		permanent,
		active,
		expires,
	}).save();

	const guildSetting = await GuildModel.findOne({
		guildiD: `${guildID}`,
	});

	const channelID = guildSetting?.infractionLogChannel;

	if (channelID) {
		const channel = client.channels.cache.get(channelID) as Discord.TextChannel;
		const guild = channel.guild;
		const description = `Infraction for <@!${userID}> | Executed by <@!${staffID}>\nType: \`${type}\`\n${reason}`;
		channel.send({
			embeds: [
				this.embedify(
					'RED',
					`${infraction._id}`,
					guild.iconURL(),
					description
				).setTimestamp(),
			],
		});
	}
}

/**
 * Gets currency symbol.
 * @param {string} guildID - Guild id.
 * @returns {string} Guild currency symbol
 */
export async function getCurrencySymbol(guildID: string): Promise<String> {
	const result = await GuildModel.findOne({
		guildID,
	});

	let currency;
	if (result?.currency) {
		currency = result.currency;
	} else {
		currency = config.cSymbol; //def
	}

	return currency;
}

/**
 * Updates the min and max payout for the specified income command
 * @param {String} guildID - Guild id.
 * @param {String} command - Income command.
 * @param {IncomeCommandProperties} properties - Command properties.
 */
export async function setCommandStats(
	guildID: string,
	properties: IncomeCommandProperties
) {
	await GuildModel.findOneAndUpdate(
		{ guildID },
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
		{ guildID },
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
 * @param {number} min - min value in range
 * @param {number} max - max value in range
 * @returns {number} Random value between two inputs
 */
export function intInRange(min: number, max: number) {
	return Math.ceil(Math.random() * (max - min) + min);
}

/**
 * Returns whether income command is successful.
 * @param {object} properties - the command properties
 * @returns {boolean} Whether income command is successful
 */
export function isSuccess(properties: IncomeCommandProperties): boolean {
	const { chance } = properties;
	return this.intInRange(0, 100) < chance ? true : false;
}

/**
 * cuts a string if longer than n and appends '...' to the end.
 * @param {string} str - the string to cut
 * @param {number} n - the size which a string must exceed to be cut
 * @param {boolean} rev - whether the string should be cut in reverse (trim the front excess off)
 * @returns {string} `str.substr(0, rev? -n : n)`
 */
export function cut(str: string, n = 50, rev = false) {
	return str.length <= n
		? str.substring(0, rev ? -n : n)
		: `${str.substring(0, rev ? -n : n)}...`;
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
 * @param {number} page
 */
export async function paginate(
	interaction: Discord.CommandInteraction,
	embeds: Discord.MessageEmbed[],
	page: number = 0
) {
	if (page > embeds.length - 1) {
		interaction.editReply(this.error('Page number out of bounds!'));
		return;
	}

	const time = 1000 * 15; //15 second on buttons
	let row = new Discord.MessageActionRow()
		.addComponents(
			new Discord.MessageButton()
				.setCustomId('previous_page')
				.setLabel('Previous')
				.setStyle('SECONDARY')
				.setDisabled(page == 0 ? true : false)
		)
		.addComponents(
			new Discord.MessageButton()
				.setCustomId('next_page')
				.setLabel('Next')
				.setStyle('PRIMARY')
				.setDisabled(page == embeds.length - 1 ? true : false)
		);

	const msg = (await interaction.editReply({
		embeds: [embeds[page]],
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
		if (page < embeds.length - 1 && page >= 0 && i.customId === 'next_page') {
			page++;
			row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('previous_page')
						.setLabel('Previous')
						.setStyle('SECONDARY')
						.setDisabled(page == 0 ? true : false)
				)
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('next_page')
						.setLabel('Next')
						.setStyle('PRIMARY')
						.setDisabled(page == embeds.length - 1 ? true : false)
				);
		} else if (
			page > 0 &&
			page < embeds.length &&
			i.customId === 'previous_page'
		) {
			page--;
			row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('previous_page')
						.setLabel('Previous')
						.setStyle('SECONDARY')
						.setDisabled(page == 0 ? true : false)
				)
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('next_page')
						.setLabel('Next')
						.setStyle('PRIMARY')
						.setDisabled(page == embeds.length - 1 ? true : false)
				);
		}

		await i.update({
			embeds: [embeds[page]],
			components: [row],
		});
	});

	collector.on('end', async () => {
		await msg.edit({
			components: [],
		});
	});
}

export async function runtimeError(
	client: EconomicaClient,
	error: Error,
	interaction: Discord.CommandInteraction = null
) {
	let description, title, icon_url;
	if (interaction) {
		title = interaction.user.tag;
		icon_url = interaction.user.displayAvatarURL();
		description = `**Command**: \`${interaction.commandName}\`\n\`\`\`js\n${error}\`\`\`
    You've encountered an error.
    Report this to Adrastopoulos#2753 or QiNG-agar#0540 in [Economica](${process.env.DISCORD}).`;
		const embed = this.embedify('RED', title, icon_url, description);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [embed], ephemeral: true });
		} else {
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	title = error.name;
	icon_url = client.user.displayAvatarURL();
	description = `\`\`\`js\n${error.stack}\`\`\``;
	const embed = this.embedify('RED', title, icon_url, description);
	const channel = (await client.channels.cache.get(
		process.env.BOT_LOG_ID
	)) as Discord.TextChannel;
	channel.send({ embeds: [embed] });
}
