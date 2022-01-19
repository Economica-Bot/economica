const config = require('../../config.json');
import * as Discord from 'discord.js';
import {
	GuildModel,
	InfractionModel,
	LoanModel,
	MarketModel,
	MemberModel,
	ShopModel,
	TransactionModel,
} from '../models/index';
import {
	EconomicaClient,
	EconomyInfo,
	IncomeCommandProperties,
	TransactionTypes,
} from '../structures/index';

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
		embed.setAuthor({ name: title, url: icon_url });
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
 * @param {string} guildID - guild id.
 * @param {string} userID - User id.
 * @returns {Promise<EconomyInfo>} wallet, treasury, total, rank
 */
export async function getEconInfo(guildID: string, userID: string): Promise<EconomyInfo> {
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
 * @param {TransactionTypes} transaction_type - The transaction type.
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
	transaction_type: TransactionTypes,
	memo: string,
	wallet: Number,
	treasury: Number,
	total: Number
): Promise<Number> {
	//Init
	await getEconInfo(guildID, userID);
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
		const cSymbol = guildSetting.currency;
		const channel = client.channels.cache.get(channelID) as Discord.TextChannel;
		const guild = channel.guild;
		const description = `Transaction for <@!${userID}>\nType: \`${transaction_type}\` | ${memo}`;
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
 * @param {string} guildID - guild id.
 * @param {string} userID - User id.
 * @param {string} staffID - Staff id.
 * @param {string} type - The punishment for the infraction.
 * @param {string} reason - The reason for the punishment.
 * @param {boolean} permanent - Whether the punishment is permanent.
 * @param {boolean} active - Whehther the punishment is active.
 * @param {number} length - The length of the punishment.
 */
export async function infraction(
	client: Discord.Client,
	guildID: string,
	userID: string,
	staffID: string,
	type: string,
	reason: string,
	permanent?: boolean,
	active?: boolean,
	duration?: number
) {
	const infraction = await new InfractionModel({
		guildID,
		userID,
		staffID,
		type,
		reason,
		permanent,
		active,
		duration,
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
			embeds: [embedify('RED', `${infraction._id}`, guild.iconURL(), description).setTimestamp()],
		});
	}
}

/**
 * Updates the min and max payout for the specified income command
 * @param {String} guildID - Guild id.
 * @param {String} command - Income command.
 * @param {IncomeCommandProperties} properties - Command properties.
 */
export async function setCommandStats(guildID: string, properties: IncomeCommandProperties) {
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
	return intInRange(0, 100) < chance ? true : false;
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
		const embed = embedify('RED', title, icon_url, description);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [embed], ephemeral: true });
		} else {
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	title = error.name;
	icon_url = client.user.displayAvatarURL();
	description = `\`\`\`js\n${error.stack}\`\`\``;
	const embed = embedify('RED', title, icon_url, description);
	const channel = (await client.channels.cache.get(process.env.BOT_LOG_ID)) as Discord.TextChannel;
	channel.send({ embeds: [embed] });
}
