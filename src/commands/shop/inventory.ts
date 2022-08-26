import { parseInteger } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { Item, Member, User } from '../../entities';
import { VariableCollector } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View purchased items.')
		.setModule('SHOP')
		.setFormat('inventory')
		.setExamples(['inventory'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execution = new Router()
		.get('', async (ctx) => {
			const user = ctx.interaction.options.getUser('user', false) ?? ctx.interaction.user;
			return `/user/${user.id}`;
		})
		.get('/user/:id', async (ctx, params) => {
			const { id } = params;
			const items = await Item.find({
				relations: ['listing'],
				where: { owner: { userId: id, guildId: ctx.interaction.guildId } },
			});
			return new ExecutionNode()
				.setName('Viewing inventory')
				.setDescription(`Viewing <@${id}>'s items | \`${items.map((item) => item.amount).reduce((prev, curr) => prev + curr, 0)}\` total`)
				.setOptions(...items.map((item) => ['select', `/item/${item.id}`, `${item.amount} x ${item.listing.name}`, item.listing.description] as const));
		})
		.get('/item/:id', async (ctx, params) => {
			const { id } = params;
			const item = await Item.findOne({ relations: ['listing', 'listing.itemsRequired', 'owner'], where: { id } });
			const options: typeof ExecutionNode.prototype.options = [];
			if (item.listing.tradeable && item.owner.userId === ctx.interaction.user.id) options.push(['button', `/item/${item.id}/give`, 'Give Item']);
			if (item.listing.type === 'USABLE' && item.owner.userId === ctx.interaction.user.id) options.push(['button', `/item/${item.id}/use`, 'Use Item']);
			return new ExecutionNode()
				.setName(`${item.amount} x ${item.listing.name}`)
				.setDescription(item.listing.description)
				.setOptions(
					['back', `/user/${item.owner.userId}`],
					...options,
				);
		})
		.get('/item/:id/give', async (ctx, params) => {
			const { id } = params;
			const item = await Item.findOne({ relations: ['listing'], where: { id } });
			const target = await new VariableCollector<GuildMember>()
				.setProperty('target')
				.setPrompt('Specify a user')
				.addValidator((msg) => !!msg.mentions.members.size, 'Could not find any user mentions.')
				.addValidator((msg) => msg.mentions.users.first().id !== msg.author.id, 'You cannot give yourself an item.')
				.setParser((msg) => msg.mentions.members.first())
				.execute(ctx);
			const amount = await new VariableCollector<number>()
				.setProperty('amount')
				.setPrompt('The amount of this item to give away.')
				.addValidator((msg) => parseInteger(msg.content) !== null && parseInteger(msg.content) !== undefined, 'Input must be an integer.')
				.addValidator((msg) => parseInteger(msg.content) > 0, 'Input must be greater than 0.')
				.addValidator((msg) => parseInteger(msg.content) <= item.amount, 'You do not have that many of this item.')
				.setParser((msg) => parseInteger(msg.content))
				.execute(ctx);
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.interaction.guildId }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.interaction.guildId });
			const targetItem = await Item.findOneBy({
				listing: { id: item.listing.id },
				owner: { userId: targetEntity.userId, guildId: targetEntity.guildId },
			});

			if (targetItem && !item.listing.stackable) throw new CommandError('That user already has that non-stackable item.');
			if (!item.listing.tradeable) throw new CommandError('This item is not tradeable.');

			if (targetItem) {
				targetItem.amount += amount;
				await targetItem.save();
			} else await Item.create({ owner: targetEntity, listing: item.listing, amount }).save();

			item.amount -= amount;
			if (item.amount === 0) await item.remove();
			else item.save();

			return new ExecutionNode()
				.setName('Item Given Successfully')
				.setDescription(`${Emojis.CHECK} Gave \`${amount}\` x **${item.listing.name}** to ${target}`)
				.setOptions(
					['back', `/user/${ctx.interaction.user.id}`],
				);
		})
		.get('/item/:id/use', async (ctx, params) => {
			const { id } = params;
			const item = await Item.findOne({ relations: ['listing'], where: { id } });
			item.listing.rolesGranted.forEach((role) => ctx.interaction.member.roles.add(role, `Used ${item.listing.name}`));
			item.listing.rolesRemoved.forEach((role) => ctx.interaction.member.roles.remove(role, `Used ${item.listing.name}`));
			item.amount -= 1;
			if (item.amount === 0) await item.remove();
			else await item.save();
			return new ExecutionNode()
				.setName('Item Used!')
				.setDescription(`**Roles Removed**:\n<@&${item.listing.rolesRemoved.join('>, <@&')}>\n\n**Roles Granted**:\n<@&${item.listing.rolesGranted.join('>, <@&')}>`);
		});
}
