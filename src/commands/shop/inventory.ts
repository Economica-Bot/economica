import { Item, Member, User } from '../../entities';
import { collectProp, displayListing } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View purchased items.')
		.setModule('SHOP')
		.setFormat('inventory')
		.setExamples(['inventory']);

	public execute = new ExecutionBuilder()
		.setName('Viewing Inventory')
		.setValue('inventory')
		.setDescription('View items that you own')
		.setPagination(
			async (ctx) => Item.find({ relations: ['listing', 'listing.itemsRequired'], where: { owner: { userId: ctx.interaction.user.id, guildId: ctx.interaction.guildId } } }),
			(item, ctx) => new ExecutionBuilder()
				.setName(item.listing.name)
				.setValue(item.listing.id)
				.setDescription(item.listing.description)
				.setEmbed(displayListing(ctx, item.listing))
				.setOptions([
					new ExecutionBuilder()
						.setName('Give Item')
						.setValue('item_give')
						.setDescription('Give this item to another user')
						.setExecution(async (ctx, interaction) => {
							const embed = ctx.embedify('info', 'user', 'Specify a user');
							const target = await collectProp(
								ctx,
								interaction,
								embed,
								'target',
								[{ function: (input) => ctx.client.users.cache.has(input), error: 'Could not find that user' },
									{ function: (input) => input !== interaction.user.id, error: 'You cannot give yourself items' },
									{ function: (input) => !ctx.client.users.cache.get(input).bot, error: 'You cannot give items to a bot' }],
								(input) => ctx.client.users.cache.get(input),
							);
							await User.upsert({ id: target.id }, ['id']);
							await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
							const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
							const targetItem = await Item.findOne({ where: { id: item.listing.id, owner: { userId: targetEntity.userId, guildId: targetEntity.guildId } } });
							if (targetEntity.userId === ctx.memberEntity.userId) {
								const embed = ctx.embedify('warn', 'user', 'You cannot give items to yourself.');
								await interaction.editReply({ embeds: [embed] });
								return;
							}

							if (targetItem && !item.listing.stackable) {
								const embed = ctx.embedify('warn', 'user', 'That user already has that non-stackable item.');
								await interaction.editReply({ embeds: [embed] });
								return;
							}

							if (targetItem) {
								targetItem.amount += 1;
								await targetItem.save();
							} else {
								await Item.create({ owner: targetEntity, listing: item.listing, amount: 1 }).save();
							}

							item.amount -= 1;
							if (item.amount === 0) await item.remove();
							else item.save();

							const successEmbed = ctx.embedify('success', 'user', `${Emojis.CHECK} Gave \`1\` x **${item.listing.name}** to <@${target.id}>.`);
							await interaction.editReply({ embeds: [successEmbed] });
						}),
					new ExecutionBuilder()
						.setName('Use Item')
						.setValue('item_use')
						.setDescription('Use this item')
						.setEnabled(item.listing.type === 'USABLE')
						.setExecution(async (ctx, interaction) => {
							item.listing.rolesGranted.forEach((role) => { ctx.interaction.member.roles.add(role, `Used ${item.listing.name}`); });
							item.listing.rolesRemoved.forEach((role) => { ctx.interaction.member.roles.remove(role, `Used ${item.listing.name}`); });
							item.amount -= 1;
							if (item.amount === 0) await item.remove();
							else await item.save();

							const embed = ctx
								.embedify('success', 'user', `Used \`1\` x **${item.listing.name}**.`)
								.addFields([{ name: 'Roles Removed', value: `<@&${item.listing.rolesRemoved.join('>, <@&')}>` }])
								.addFields([{ name: 'Roles Given', value: `<@&${item.listing.rolesGranted.join('>, <@&')}>` }]);
							await interaction.update({ embeds: [embed], components: [] });
						}),
				]),
		);
}
