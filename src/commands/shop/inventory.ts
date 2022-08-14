import { parseInteger } from '@adrastopoulos/number-parser';

import { Item, Member, User } from '../../entities';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View purchased items.')
		.setModule('SHOP')
		.setFormat('inventory')
		.setExamples(['inventory'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execution = new ExecutionNode<'top'>()
		.setName('Viewing Inventory')
		.setValue('inventory')
		.setDescription('View items that you or another user owns')
		.setExecution(async (ctx) => {
			ctx.variables.user = ctx.interaction.options.getUser('user', false) ?? ctx.interaction.user;
			ctx.variables.items = await Item.find({
				relations: ['listing', 'listing.itemsRequired'],
				where: { owner: { userId: ctx.interaction.options.getUser('user')?.id ?? ctx.interaction.user.id, guildId: ctx.interaction.guildId } },
			});
		})
		.setOptions((ctx) => ctx.variables.items.map((item) => new ExecutionNode()
			.setName(`${item.amount} x ${item.listing.name}`)
			.setValue(`inventory_${item.listing.id}`)
			.setType('select')
			.setDescription(item.listing.description)
			.setOptions(() => [
				new ExecutionNode()
					.setName('Give Item')
					.setValue(`inventory_${item.listing.id}_give`)
					.setType('button')
					.setDescription('Give this item to another user')
					.setPredicate((ctx) => item.listing.tradeable && ctx.variables.user.id === ctx.interaction.user.id)
					.collectVar((collector) => collector
						.setProperty('target')
						.setPrompt('Specify a user')
						.addValidator((msg) => !!msg.mentions.members.size, 'Could not find any user mentions.')
						.addValidator((msg) => msg.mentions.users.first().id !== msg.author.id, 'You cannot give yourself an item.')
						.setParser((msg) => msg.mentions.members.first()))
					.collectVar((collector) => collector
						.setProperty('amount')
						.setPrompt('The amount of this item to give away.')
						.addValidator((msg) => parseInteger(msg.content) !== null && parseInteger(msg.content) !== undefined, 'Input must be an integer.')
						.addValidator((msg) => parseInteger(msg.content) > 0, 'Input must be greater than 0.')
						.addValidator((msg) => parseInteger(msg.content) <= item.amount, 'You do not have that many of this item.')
						.setParser((msg) => parseInteger(msg.content)))
					.setExecution(async (ctx) => {
						const { target } = ctx.variables;
						const { amount } = ctx.variables;

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
					})
					.setOptions(() => [
						new ExecutionNode()
							.setName('Item Given Successfully')
							.setValue('item_give_result')
							.setType('display')
							.setDescription((ctx) => `${Emojis.CHECK} Gave \`${ctx.variables.amount}\` x **${item.listing.name}** to <@${ctx.variables.target.id}>.`),
					]),
				new ExecutionNode()
					.setName('Use Item')
					.setValue(`inventory.${item.listing.id}-use`)
					.setType('button')
					.setDescription('Use this item')
					.setPredicate(() => item.listing.type === 'USABLE' && ctx.variables.user.id === ctx.interaction.user.id)
					.setExecution(async (ctx) => {
						item.listing.rolesGranted.forEach((role) => ctx.interaction.member.roles.add(role, `Used ${item.listing.name}`));
						item.listing.rolesRemoved.forEach((role) => ctx.interaction.member.roles.remove(role, `Used ${item.listing.name}`));
						item.amount -= 1;
						if (item.amount === 0) await item.remove();
						else await item.save();
					})
					.setOptions(() => [
						new ExecutionNode()
							.setName('item Used!')
							.setValue('inventory_use')
							.setType('display')
							.setDescription(`**Roles Removed**:\n<@&${item.listing.rolesRemoved.join('>, <@&')}>\n\n**Roles Granted**:\n<@&${item.listing.rolesGranted.join('>, <@&')}>`),
					])])));
}
