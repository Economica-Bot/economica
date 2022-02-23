import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import ms from 'ms';

import { ListingModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { ListingString } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('listing')
		.setDescription('Interact with shop listings')
		.setModule('SHOP')
		.setFormat('listing')
		.setExamples(['listing'])
		.setAuthority('MANAGER')
		.addSubcommand((subcommand) => subcommand
			.setName('create')
			.setDescription('Create a shop listing')
			.addStringOption((option) => option.setName('type').setDescription('Specify the type').setRequired(true))
			.addStringOption((option) => option.setName('name').setDescription('Specify the name').setRequired(true))
			.addNumberOption((option) => option.setName('price').setDescription('The required wallet balance to purchase the listing').setMinValue(0).setRequired(true))
			.addStringOption((option) => option.setName('description').setDescription('Specify the description'))
			.addIntegerOption((option) => option.setName('stock').setDescription('Specify the initial stock').setMinValue(0))
			.addBooleanOption((option) => option.setName('stackable').setDescription('Whether users can buy multiple of this item'))
			.addStringOption((option) => option.setName('duration').setDescription('The length of time this listing lasts'))
			.addNumberOption((option) => option.setName('required_treasury').setDescription('The required treasury balance to purchase the listing')))
		.addSubcommand((subcommand) => subcommand.setName('edit').setDescription('Edit a shop listing'));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'create') {
			const type = ctx.interaction.options.getString('type') as ListingString;
			const name = ctx.interaction.options.getString('name');
			const price = ctx.interaction.options.getNumber('price');
			const description = ctx.interaction.options.getString('description', false) || 'An interesting item';
			const stock = ctx.interaction.options.getInteger('stock', false) || Number.POSITIVE_INFINITY;
			const stackable = ctx.interaction.options.getBoolean('stackable', false) || false;
			const duration = ctx.interaction.options.getString('duration', false) || Number.POSITIVE_INFINITY.toString();
			const required_treasury = ctx.interaction.options.getNumber('required_treasury', false) || 0;
			const embed = new MessageEmbed().setTitle('Item Create').setDescription(
				`\`\`\`Listing type: ${type}\nListing name: ${name}\nListing price: ${price}\nListing stock: ${stock}\nStackable? ${stackable}\nDuration: ${ms(duration)}ms\nRequired Treasury: ${required_treasury}\`\`\``,
			);

			await ctx.interaction.reply({ embeds: [embed] });
			return;
		}

		const optionRow = new MessageActionRow().addComponents([
			new MessageSelectMenu().setCustomId('select_action').setPlaceholder('Nothing selected').addOptions([
				{ label: 'Create Listing', description: 'Make a new shop listing', value: 'create_listing' },
				{ label: 'Edit Listing', description: 'Edit a shop listing', value: 'edit_listing' },
				{ label: 'Manage Listing', description: 'Manage a shop listing', value: 'manage_listing' },
			]),
		]);

		// Create a listing
		const editRow = new MessageActionRow().addComponents([
			new MessageButton().setCustomId('add_required_item').setLabel('Add Required Item').setStyle('PRIMARY'),
			new MessageButton().setCustomId('add_required_role').setLabel('Add Required Role').setStyle('PRIMARY'),
			new MessageButton().setCustomId('add_role_given').setLabel('Add Role Given').setStyle('PRIMARY'),
			new MessageButton().setCustomId('add_rele_removed').setLabel('Add Role Removed').setStyle('PRIMARY'),
		]);
		const confirmRow = new MessageActionRow().addComponents([
			new MessageButton().setCustomId('publish').setLabel('Publish Listing').setStyle('SUCCESS'),
			new MessageButton().setCustomId('cancel').setLabel('Cancel Listing').setStyle('DANGER'),
		]);

		await ctx.interaction.reply('test');
	};
}
