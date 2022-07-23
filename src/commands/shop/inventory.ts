import { parseInteger } from '@adrastopoulos/number-parser';
import { Item, Member, User } from '../../entities';
import { displayListing } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View purchased items.')
		.setModule('SHOP')
		.setFormat('inventory')
		.setExamples(['inventory'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execute = new ExecutionBuilder()
		.setName('Viewing Inventory')
		.setValue('inventory')
		.setDescription('View items that you own')
		.setPagination(
			async (ctx) => Item.find({
				relations: ['listing', 'listing.itemsRequired'],
				where: {
					owner: {
						userId: ctx.interaction.options.getUser('user')?.id ?? ctx.interaction.user.id,
						guildId: ctx.interaction.guildId,
					},
				},
			}),
			(item, ctx) => new ExecutionBuilder()
				.setName(`${item.amount} x ${item.listing.name}`)
				.setValue(item.listing.id)
				.setDescription(item.listing.description)
				.setEmbed(displayListing(ctx, item.listing))
				.setOptions([
					new ExecutionBuilder()
						.setName('Give Item')
						.setValue('item_give')
						.setDescription('Give this item to another user')
						.setPredicate((ctx) => {
							const user = ctx.interaction.options.getUser('user');
							if (user) return ctx.interaction.user.id === user.id;
							return true;
						})
						.collectVar((collector) => collector
							.setProperty('target')
							.setPrompt('Specify a user')
							.addValidator((msg) => !!msg.mentions.members.size, 'Could not find any user mentions.')
							.setParser((msg) => msg.mentions.members.first()))
						.collectVar((collector) => collector
							.setProperty('amount')
							.setPrompt('The amount of this item to give away.')
							.addValidator(
								(msg) => parseInteger(msg.content) !== null && parseInteger(msg.content) !== undefined,
								'Input must be an integer.',
							)
							.addValidator((msg) => parseInteger(msg.content) > 0, 'Input must be greater than 0.')
							.addValidator(
								(msg) => parseInteger(msg.content) <= item.amount,
								'You do not have that many of this item.',
							)
							.setParser((msg) => parseInteger(msg.content)))
						.setExecution(async (ctx, interaction) => {
							const target = this.execute.getVariable('target');
							const amount = this.execute.getVariable('amount');

							await User.upsert({ id: target.id }, ['id']);
							await Member.upsert({ userId: target.id, guildId: interaction.guildId }, ['userId', 'guildId']);
							const targetEntity = await Member.findOneBy({ userId: target.id, guildId: interaction.guildId });
							const targetItem = await Item.findOneBy({
								listing: { id: item.listing.id },
								owner: { userId: targetEntity.userId, guildId: targetEntity.guildId },
							});

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
								targetItem.amount += amount;
								await targetItem.save();
							} else {
								await Item.create({ owner: targetEntity, listing: item.listing, amount }).save();
							}

							item.amount -= amount;
							if (item.amount === 0) await item.remove();
							else item.save();

							const successEmbed = ctx.embedify(
								'success',
								'user',
								`${Emojis.CHECK} Gave \`${amount}\` x **${item.listing.name}** to <@${target.id}>.`,
							);
							await interaction.editReply({ embeds: [successEmbed] });
						}),
					new ExecutionBuilder()
						.setName('Use Item')
						.setValue('item_use')
						.setDescription('Use this item')
						.setPredicate(
							(ctx) => ctx.interaction.options.getUser('user')
									&& ctx.interaction.user.id === ctx.interaction.options.getUser('user').id
									&& item.listing.type === 'USABLE',
						)
						.setEnabled(item.listing.type === 'USABLE')
						.setExecution(async (ctx, interaction) => {
							item.listing.rolesGranted.forEach((role) => {
								ctx.interaction.member.roles.add(role, `Used ${item.listing.name}`);
							});
							item.listing.rolesRemoved.forEach((role) => {
								ctx.interaction.member.roles.remove(role, `Used ${item.listing.name}`);
							});
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
