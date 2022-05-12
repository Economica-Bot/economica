import { Item, Listing, Member, User } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('item')
		.setDescription('Interact with inventory items')
		.setModule('SHOP')
		.setFormat('item <use | give>')
		.setExamples(['item'])
		.setClientPermissions(['ManageRoles'])
		.addSubcommand((subcommand) => subcommand
			.setName('use')
			.setDescription('Use an item')
			.addStringOption((option) => option
				.setName('query')
				.setDescription('Specify an item name or id')
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('give')
			.setDescription('Give an item away')
			.addStringOption((option) => option
				.setName('query')
				.setDescription('Specify an item name or id')
				.setRequired(true))
			.addUserOption((option) => option
				.setName('target')
				.setDescription('Specify a target')
				.setRequired(true))
			.addIntegerOption((option) => option
				.setName('amount')
				.setDescription('Specify the amount')
				.setMinValue(1)));

	public execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const query = ctx.interaction.options.getString('query');

		const item = await Item.findOne({
			relations: ['listing', 'owner'],
			where: [
				{ owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId }, listing: { name: query } },
				{ owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId }, id: query },
			],
		});

		if (!item) {
			await ctx.embedify('error', 'user', `No item with name or id \`${query}\` exists.`).send(true);
			return;
		}

		if (subcommand === 'use') {
			if (item.listing.type !== 'USABLE') {
				await ctx.embedify('error', 'user', `This item is not usable, it is a \`${item.listing.type}\` type.`).send(true);
				return;
			}

			item.listing.rolesGiven.forEach((role) => { ctx.interaction.member.roles.add(role, `Used ${item.listing.name}`); });
			item.listing.rolesRemoved.forEach((role) => { ctx.interaction.member.roles.remove(role, `Used ${item.listing.name}`); });
			item.amount -= 1;
			if (item.amount === 0) await item.remove();
			else await item.save();

			await ctx
				.embedify('success', 'user', `Used \`1\` x **${item.listing.name}**.`)
				.addFields([{ name: 'Roles Removed', value: `<@&${item.listing.rolesRemoved.join('>, <@&')}>` }])
				.addFields([{ name: 'Roles Given', value: `<@&${item.listing.rolesGiven.join('>, <@&')}>` }])
				.send();
		} else if (subcommand === 'give') {
			const target = ctx.interaction.options.getUser('target');
			const amount = ctx.interaction.options.getInteger('amount') ?? 1;

			const targetEntity = await Member.findOne({ where: { user: { id: target.id }, guild: { id: ctx.guildEntity.id } } })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
			const targetItem = await Item.findOne({ where: { id: item.listing.id, owner: { userId: targetEntity.userId, guildId: targetEntity.guildId } } });

			if (targetItem && !item.listing.stackable) await ctx.embedify('warn', 'user', 'That user already has that non-stackable item.').send();
			else if (amount > item.amount) await ctx.embedify('warn', 'user', `You do not have \`${amount}\` x **${item.listing.name}s**.`).send();
			if (ctx.interaction.replied) return;

			if (targetItem) {
				targetItem.amount += amount;
				await targetItem.save();
			} else {
				await Item.create({ owner: targetEntity, listing: item.listing, amount }).save();
			}

			item.amount -= 1;
			if (item.amount === 0) await item.remove();
			else item.save();

			await ctx.embedify('success', 'user', `${Emojis.CHECK} Gave \`${amount}\` x **${item.listing.name}** to <@${target.id}>.`).send();
		}
	};
}
