import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

import { Listing } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { INTERACTION_COMPONENT_COOLDOWN, Emojis } from '../../typings/constants.js';
import { ListingString } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('listing')
		.setDescription('Manage or create shop listings')
		.setModule('SHOP')
		.setFormat('listing')
		.setExamples(['listing'])
		.setAuthority('USER')
		.setDefaultPermission(false)
		.addSubcommand((subcommand) => subcommand
			.setName('create')
			.setDescription('Create a new item')
			.addStringOption((option) => option.setName('name').setDescription('Specify the name').setRequired(true))
			.addIntegerOption((option) => option.setName('price').setDescription('Specify the price').setMinValue(0).setRequired(true))
			.addStringOption((option) => option.setName('type').setDescription('Specify the type').setRequired(true).addChoices(
				{ name: 'Classic', value: 'CLASSIC' },
				{ name: 'Instant', value: 'INSTANT' },
				{ name: 'Usable', value: 'USABLE' },
				{ name: 'Generator', value: 'GENERATOR' },
			)))
		.addSubcommand((subcommand) => subcommand
			.setName('manage')
			.setDescription('Manage a shop listing')
			.addStringOption((option) => option.setName('listing_id').setDescription('Specify a listing').setRequired(true)));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'create') {
			const description = `**Create the item, ${ctx.interaction.member}, of your wildest dreams! Customize your fantastic generator, rare collectible, or classic old item.**\n\n${Emojis.SELECT} Click a button below to customize your item.`;
			// const name = ctx.interaction.options.getString('name');
			// const price = ctx.interaction.options.getInteger('price');
			const type = ctx.interaction.options.getString('type') as ListingString;
			const embed = ctx
				.embedify('info', 'user', description)
				.setAuthor({ name: 'Item Creation', iconURL: ctx.interaction.guild.iconURL() });
			const rows: ActionRowBuilder<ButtonBuilder>[] = [];
			rows.push(new ActionRowBuilder<ButtonBuilder>()
				.setComponents(
					new ButtonBuilder().setCustomId('stock').setLabel('Stock').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.STOCK }),
					new ButtonBuilder().setCustomId('duration').setLabel('Duration').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.INTERVAL }),
					new ButtonBuilder().setCustomId('stackable').setLabel('Stackable').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.STACK }),
				));
			rows.push(new ActionRowBuilder<ButtonBuilder>()
				.setComponents(
					new ButtonBuilder().setCustomId('required_treasury').setLabel('Required Treasury').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.TREASURY }),
					new ButtonBuilder().setCustomId('required_items').setLabel('Required Items').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.SEARCH }),
					new ButtonBuilder().setCustomId('required_roles').setLabel('Required Roles').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.SETTINGS }),
					new ButtonBuilder().setCustomId('roles_given').setLabel('Roles Given').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.SETTINGS }),
					new ButtonBuilder().setCustomId('roles_removed').setLabel('Roles Removed').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.SETTINGS }),
				));
			if (type === 'GENERATOR') {
				rows.push(new ActionRowBuilder<ButtonBuilder>()
					.setComponents(
						new ButtonBuilder().setCustomId('generator_amount').setLabel('Generator Amount').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.GENERATOR }),
						new ButtonBuilder().setCustomId('generator_period').setLabel('Generator Period').setStyle(ButtonStyle.Primary).setEmoji({ id: Emojis.INTERVAL }),
					));
			}
			rows.push(new ActionRowBuilder<ButtonBuilder>()
				.setComponents(
					new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger).setEmoji({ id: Emojis.CANCEL }),
					new ButtonBuilder().setCustomId('validate').setLabel('Validate').setStyle(ButtonStyle.Secondary).setEmoji({ id: Emojis.INFO }),
					new ButtonBuilder().setCustomId('publish').setLabel('Publish').setStyle(ButtonStyle.Success).setEmoji({ id: Emojis.PUBLISH }),
				));

			const message = await ctx.interaction.reply({ embeds: [embed], components: rows, fetchReply: true });
			// const listing = Listing.create({ guild: ctx.guildEntity, type, name });
			await this.createListing(/* ctx, */message /* , listing */);
		} else if (subcommand === 'manage') {
			const query = ctx.interaction.options.getString('listing_id');
			const listing = await Listing.findOne({ where: { id: query } });
			if (!listing) {
				await ctx.embedify('error', 'user', `Could not find listing named \`${query}\``).send(true);
				return;
			}

			const embed = ctx.embedify('info', 'user', 'Loan');
			await ctx.interaction.reply({ embeds: [embed] });
		}
	};

	private async createListing(/* ctx: Context, */ message: Message<true> /* , listing: Listing */) {
		const button = await message.awaitMessageComponent({ componentType: ComponentType.Button, time: INTERACTION_COMPONENT_COOLDOWN }).catch(() => null);
		if (button.customId === 'description') button.reply({ content: 'How many times the listing can be sold', ephemeral: true });
		if (button.customId === 'duration') button.reply({ content: 'This listing\'s shelf life', ephemeral: true });
		if (button.customId === 'stackable') button.reply({ content: 'Whether the listing can be purchased multiple times', ephemeral: true });
		if (button.customId === 'required_treasury') button.reply({ content: 'The minimum treasury balance', ephemeral: true });
		if (button.customId === 'required_items') button.reply({ content: 'Items that must be owned before purchasing this listing', ephemeral: true });
		if (button.customId === 'required_roles') button.reply({ content: 'Required roles in order to purchase this listing', ephemeral: true });
		if (button.customId === 'roles_given') button.reply({ content: 'Roles given when using this item', ephemeral: true });
		if (button.customId === 'roles_removed') button.reply({ content: 'Roles removed when using this item', ephemeral: true });
		if (button.customId === 'generator_amount') button.reply({ content: 'How much this generator makes per iteration', ephemeral: true });
		if (button.customId === 'generator_period') button.reply({ content: 'The duration in which the generator iterates', ephemeral: true });
		if (button.customId === 'cancel') button.reply({ content: 'cancel', ephemeral: true });
		if (button.customId === 'validate') button.reply({ content: 'validate', ephemeral: true });
		if (button.customId === 'publish') button.reply({ content: 'publish', ephemeral: true });
	}
}
