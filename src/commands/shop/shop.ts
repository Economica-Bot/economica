import { CommandInteraction, MessageEmbed, MessageEmbedAuthor } from 'discord.js';
import {
    EconomicaClient,
    EconomicaCommand,
    EconomicaSlashCommandBuilder,
} from '../../structures/index';
import { ShopModel, GuildModel } from '../../models/index'
import * as util from '../../util/util'

export default class implements EconomicaCommand {
    data = new EconomicaSlashCommandBuilder()
        .setName('shop')
        .setDescription('Interact with the server\'s shop.')
        .setFormat('<view | clear>')
        .setGroup('shop')
        .addEconomicaSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the items in the server\'s shop')
                .addIntegerOption(options =>
                    options
                        .setName('page')
                        .setDescription('The page of the shop to view.')
                        .setRequired(false) // default: 1
                )
        )
        .addEconomicaSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Delete all items in the shop.')
                .addBooleanOption(options =>
                    options
                        .setName('remove_from_members')
                        .setDescription('Also remove all CURRENT shop items from members.')
                        .setRequired(false) // default: FALSE
                )
        )

    execute = async (client: EconomicaClient, interaction: CommandInteraction): Promise<any> => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand == 'view') {
            // Whether there are items in the shop or not, these embed attributes will be constant
            // Note: hence, changing these attributes will also affect the pages!
            const page = new MessageEmbed()
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                })
                .setColor('BLUE')

            // Array of shop items in this guild
            const shop = await ShopModel.find({
                guildID: interaction.guildId
            });

            // Order items by ascending price
            shop.sort((a, b) => a.price - b.price)

            // There are no items in the shop
            if (!shop.length) 
                return await interaction.reply({
                    embeds: [
                        page
                            .setDescription(`There are currently no items in the ${interaction.guild.name} shop. Ask your economy manager to add some!`)
                            .setFooter({
                                text: 'Page 1 of 1'
                            })
                    ]
                })
            
            // The currency symbol for prices
            const { currency } = await GuildModel.findOne({
                guildID: interaction.guildId
            })
            // The page number to display
            const pageNumber = interaction.options.getInteger('page') ?? 1
            // page[]
            const embeds: MessageEmbed[] = []
            // Max items on each page
            const maxEntries = 15
            // Collection of items to be displayed
            const filteredEntries: any[] = []

            shop.forEach(item => {
                if (item.active) 
                    filteredEntries.push(item)
            })

            // Total number of pages
            const pageCount = Math.ceil(filteredEntries.length / maxEntries)

            // Nested count
            let c = 0

            // Outer loop: contruct each page
            for (let i = 0; i < pageCount; i++) {
                // Reset page info
                page.setFields([])
                page.setFooter({
                    text: `Page ${i + 1} of ${pageCount}`
                })

                // Inner loop: push each item to page
                for (let j = 0; j < maxEntries; j++) {
                    // One individual Shop_Items document
                    const item = filteredEntries[c]

                    // No more items
                    if (!item)
                        break
                    
                    page.setDescription(`There are currently \`${filteredEntries.length}\` items in the ${interaction.guild.name} shop.`)
                    //             Display item price and name                         Shortened description and stock                                                                    Inline if small desc.
                    page.addField(`${currency}${item.price ?? 'Free'} • ${item.name}`, util.cut(item.description ?? 'An interesting item', 150) + `\nIn-stock: \`${item.stock ?? '∞'}\``, item.description?.length <= 75)

                    c++
                }

                // Push completed page to page list
                embeds.push(page)
            }

            // Unpaginated **
            return interaction.options.getInteger('page')? await interaction.reply({ embeds: [embeds[pageNumber - 1]] }) : await interaction.reply({ embeds })
        }
    }
}