import { MessageEmbed } from 'discord.js';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures/index';
import { ShopModel, GuildModel, MemberModel } from '../../models/index';
import * as util from '../../util/util';
import { hyperlinks, authors } from '../../util/index';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('shop')
		.setDescription("Interact with the server's shop.")
		.setFormat('<view | clear>')
		.setGroup('shop')
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription("View the items in the server's shop")
				.addIntegerOption(
					(options) =>
						options
							.setName('page')
							.setDescription('The page of the shop to view.')
							.setRequired(false) // default: 1
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('clear')
				.setDescription('Delete all items in the shop.')
				.addStringOption((options) =>
					options
						.setName('confirm')
						.setDescription('This action cannot be undone.')
						.addChoice('Yes, delete all shop items forever.', 'CONFIRMED')
						.addChoice('No, keep our shop items.', 'NOT CONFIRMED')
						.setRequired(true)
				)
				.addBooleanOption(
					(options) =>
						options
							.setName('remove_from_members')
							.setDescription('Also remove all CURRENT shop items from members.')
							.setRequired(false) // default: FALSE
				)
		);

	execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();

		// Array of shop items in this guild
		const shop = await ShopModel.find({
			guildID: ctx.interaction.guildId,
		});

		// Order items by ascending price
		shop.sort((a, b) => a.price - b.price);

		if (subcommand == 'view') {
			// Whether there are items in the shop or not, these embed attributes will be constant
			// Note: hence, changing these attributes will also affect the pages!
			const page = new MessageEmbed()
				.setAuthor({
					name: ctx.interaction.guild.name,
					iconURL: ctx.interaction.guild.iconURL(),
				})
				.setColor('BLUE');

			// There are no items in the shop
			if (!shop.length)
				return await ctx.interaction.reply({
					embeds: [
						page
							.setDescription(
								`There are currently no items in the ${ctx.interaction.guild.name} shop. Ask your economy manager to add some!`
							)
							.setFooter({
								text: 'Page 1 of 1',
							}),
					],
				});

			// The currency symbol for prices
			const { currency } = await GuildModel.findOne({
				guildID: ctx.interaction.guildId,
			});
			// The page number to display
			const pageNumber = ctx.interaction.options.getInteger('page') ?? 1;
			// page[]
			const embeds: MessageEmbed[] = [];
			// Max items on each page
			const maxEntries = 15;
			// Collection of items to be displayed
			const filteredEntries: any[] = [];

			shop.forEach((item) => {
				if (item.active) filteredEntries.push(item);
			});

			// Total number of pages
			const pageCount = Math.ceil(filteredEntries.length / maxEntries);

			// Nested count
			let c = 0;

			// Outer loop: contruct each page
			for (let i = 0; i < pageCount; i++) {
				// Reset page info
				page.setFields([]);
				page.setFooter({
					text: `Page ${i + 1} of ${pageCount}`,
				});

				// Inner loop: push each item to page
				for (let j = 0; j < maxEntries; j++) {
					// One individual Shop_Items document
					const item = filteredEntries[c];

					// No more items
					if (!item) break;

					page.setDescription(
						`There are currently \`${filteredEntries.length}\` items in the ${ctx.interaction.guild.name} shop.`
					);
					//             Display item price and name                         Shortened description and stock                                                                    Inline if small desc.
					page.addField(
						`${currency}${item.price ?? 'Free'} • ${item.name}`,
						util.cut(item.description ?? 'An interesting item', 150) +
							`\nIn-stock: \`${item.stock ?? '∞'}\``,
						item.description?.length <= 75
					);

					c++;
				}

				// Push completed page to page list
				embeds.push(page);
			}

			// Unpaginated **
			return ctx.interaction.options.getInteger('page')
				? await ctx.interaction.reply({ embeds: [embeds[pageNumber - 1]] })
				: await ctx.interaction.reply({ embeds });
		} else if (subcommand == 'clear') {
			// The user did not confirm the purge
			if (!(ctx.interaction.options.getString('confirm') === 'CONFIRMED'))
				return await ctx.interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor('YELLOW')
							.setAuthor(authors.abort)
							.setTitle('Shop:shop clear')
							.setDescription(
								`Shop clearing process was intentionally aborted because you did not confirm the data deletion. Be sure to select \`Yes\` on the \`confirm\` option if this was a mistake.\n\n${hyperlinks.insertAll()}`
							),
					],
					ephemeral: true,
				});

			// The user confirmed the purge.

			// There are no items.
			if (!shop.length)
				return await ctx.interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor('YELLOW')
							.setAuthor(authors.abort)
							.setTitle('Shop:shop clear')
							.setDescription(
								`Shop clearing process was intentionally aborted because there are no items in the shop to clear.\n\n${hyperlinks.insertAll()}`
							),
					],
				});

			// Clear all shop items from members' inventories.
			if (ctx.interaction.options.getBoolean('remove_from_members')) {
				// Counts
				let deletedItems = 0;

				// Outer loop: clear all items in the shop.
				shop.forEach((item) => {
					// Inner loop: clear item from all members in the guild.
					ctx.interaction.guild.members.cache.forEach(async (member) => {
						// The member's schema object.
						const { inventory } = await MemberModel.findOne({
							guildID: ctx.interaction.guildId,
							userID: member.id,
						});

						// Check if the member has the item in his inventory
						inventory.forEach(async (inventoryItem) => {
							// If so, delete it
							if (inventoryItem.name == item.name) {
								delete inventory[inventory.indexOf(inventoryItem)];

								// And update the document
								await MemberModel.updateOne(
									{
										guildID: ctx.interaction.guildId,
										userID: member.id,
									},
									{
										inventory,
									}
								);
							}

							deletedItems++;
						});

						// Delete the item
						await ShopModel.deleteOne({
							guildID: ctx.interaction.guildId,
							name: item.name,
						});
					});
				});

				return await ctx.interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor('GREEN')
							.setAuthor(authors.success)
							.setTitle('Shop:shop clear')
							.setDescription(
								`• \`${shop.length}\` items were successfully deleted from the ${
									ctx.interaction.guild.name
								} shop by \`${
									ctx.interaction.user.tag
								}\`\n• \`${deletedItems}\` were removed from members' inventories by \`${
									ctx.interaction.user.tag
								}\`\n\n${hyperlinks.insertAll()}`
							),
					],
				});
			} else {
				// Clear all items in the shop
				await ShopModel.deleteMany({
					guildID: ctx.interaction.guildId,
				});

				return await ctx.interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor('GREEN')
							.setAuthor(authors.success)
							.setTitle('Shop:shop clear')
							.setDescription(
								`\`${shop.length}\` items were successfully deleted from the ${
									ctx.interaction.guild.name
								} shop by \`${ctx.interaction.user.tag}\`\n\n${hyperlinks.insertAll()}`
							),
					],
				});
			}
		}
	};
}
