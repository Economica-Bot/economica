import {
	ActionRowBuilder,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	MessageActionRowComponentBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	Util,
} from 'discord.js';

import { WEBSITE_COMMANDS_URL, WEBSITE_DOCS_URL, WEBSITE_HOME_URL, WEBSITE_VOTE_URL } from '../../config.js';
import {
	Command,
	Context,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../../structures/index.js';
import { INTERACTION_COMPONENT_COOLDOWN, Emojis, Modules } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription('Get information about a command or module')
		.setModule('UTILITY')
		.setFormat('help [command]')
		.setExamples(['help', 'help permissions'])
		.setAuthority('USER')
		.setDefaultPermission(false)
		.setGlobal(true)
		.addStringOption((option) => option.setName('query').setDescription('Specify a command.').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('query');
		if (!query) {
			const helpEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Economica Help Dashboard', iconURL: ctx.client.user.displayAvatarURL() })
				.setDescription(`${Emojis.HELP} **Welcome to the ${ctx.interaction.user} Help Dashboard!**\nHere, you can get information about any command or module. Use the select menu below to specify a module.\n\n${Emojis.ECONOMICA_LOGO_0} **The Best New Discord Economy Bot**\nTo become more familiar with Economica, please refer to the [documentation](${WEBSITE_DOCS_URL}). There you can set up various permissions-related settings and get detailed information about all command modules.\n\n🔗 **Useful Links**:\n**[Home Page](${WEBSITE_HOME_URL}) | [Command Docs](${WEBSITE_COMMANDS_URL}) | [Vote For Us](${WEBSITE_VOTE_URL})**`);
			const msg = await ctx.interaction.reply({ embeds: [helpEmbed], ephemeral: true, fetchReply: true });
			await this.displayHelp(ctx, ctx.interaction, msg);
			return;
		}

		const command = ctx.client.commands.find((v) => v.data.name.toLowerCase() === query.toLowerCase());
		if (!command) {
			await ctx.embedify('error', 'user', `Could not find command \`${query}\``).send(true);
			return;
		}

		const commandEmbed = new EmbedBuilder()
			.setAuthor({ name: `${command.data.name} | ${command.data.description}`, iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.COMMAND).id).url })
			.setDescription(`${Emojis.FORMAT} **Format**: \`${command.data.format}\`\n${Emojis.RESEARCH} **Examples**: \`\`\`${command.data.examples.join('\n')}\`\`\``)
			.setFooter({ text: ctx.interaction.user.tag, iconURL: ctx.interaction.user.displayAvatarURL() })
			.setTimestamp();
		command.data.options.forEach((option) => {
			if (option instanceof EconomicaSlashCommandSubcommandBuilder) {
				commandEmbed.addFields({ name: `${command.data.name} ${option.name}`, value: option.description });
			} else if (option instanceof EconomicaSlashCommandSubcommandGroupBuilder) {
				commandEmbed.addFields({ name: `${command.data.name} ${option.name}`, value: option.description });
				option.options.forEach((opt: EconomicaSlashCommandSubcommandBuilder) => {
					commandEmbed.addFields({ name: `${command.data.name} ${option.name} ${opt.name}`, value: opt.description, inline: true });
				});
			}
		});
		await ctx.interaction.reply({ embeds: [commandEmbed], ephemeral: true });
	};

	private async displayHelp(ctx: Context, i: CommandInteraction, message: Message<true>) {
		const labels = Object.keys(Modules).map((module) => new SelectMenuOptionBuilder().setLabel(module).setValue(module));
		const dropdown = new ActionRowBuilder<MessageActionRowComponentBuilder>()
			.setComponents(
				new SelectMenuBuilder()
					.setCustomId('help_select')
					.setPlaceholder('None Selected')
					.setOptions(...labels),
			);
		await i.editReply({ components: [dropdown] });
		const interaction = await message.awaitMessageComponent({ componentType: ComponentType.SelectMenu, time: INTERACTION_COMPONENT_COOLDOWN });
		const description = ctx.client.commands
			.filter(({ data }) => data.module === interaction.values[0])
			.map((command) => `**${command.data.name}**\n> ${command.data.description}`).join('\n');
		const moduleEmbed = new EmbedBuilder()
			.setAuthor({ name: `${interaction.values[0]} Module` })
			.setDescription(description);
		const msg = await interaction.update({ embeds: [moduleEmbed.toJSON()], fetchReply: true });
		this.displayHelp(ctx, i, msg);
	}
}
