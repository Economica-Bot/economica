import * as Discord from 'discord.js';

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
