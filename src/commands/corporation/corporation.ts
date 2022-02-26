import { Message } from "discord.js";

import { getEconInfo, validateObjectId } from "../../lib";
import {
  Corporation,
  CorporationModel,
  IndustryArr,
  IndustryString,
} from "../../models";
import {
  Context,
  Command,
  EconomicaSlashCommandBuilder,
} from "../../structures";

export default class implements Command {
  data = new EconomicaSlashCommandBuilder()
    .setName("corporation")
    .setDescription("View or build a booming corporation.")
    .setModule("CORPORATION")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View active corporations in this server.")
        .addStringOption((option) =>
          option
            .setName("corporation_id")
            .setDescription("Specify the corporation by id.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a new corporation.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Specify the name")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("industry")
            .setDescription("Specify the industry")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("Specify the description")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("balance")
            .setDescription("Specify the starting balance.")
            .setMinValue(10000)
            .setRequired(true)
        )
    );

  public execute = async (ctx: Context): Promise<Message | void> => {
    const subcommand = ctx.interaction.options.getSubcommand();
    const subcommandGroup = ctx.interaction.options.getSubcommandGroup(false);

    if (subcommand === "view") {
      const { valid, document } = await validateObjectId(ctx, "Corporation");
      if (!valid) {
        return;
      } else if (document) {
        return await this.displayCorporation(ctx, document);
      } else {
        const corporationDocuments = await CorporationModel.find({
          guild: ctx.guildDocument,
        }).sort({ createdAt: 1 });
        const corporationList = [];
        for (let i = 0; i < corporationDocuments.length; i++) {
          const description = `**${corporationDocuments[i].name}**\n> \`${corporationDocuments[i].industry}\` | ID: \`${corporationDocuments[i]._id}\`\n> *${corporationDocuments[i].description}*`;
          corporationList.push(description);
        }

        return await ctx.embedify(
          "info",
          { name: "Corporations" },
          corporationList.join("\n\n"),
          false
        );
      }
    } else if (subcommand === "create") {
      const name = ctx.interaction.options.getString("name");
      const industry = ctx.interaction.options
        .getString("industry")
        .toUpperCase() as IndustryString;
      const description = ctx.interaction.options.getString("description");
      const balance = ctx.interaction.options.getInteger("balance");

      const { wallet } = await getEconInfo(ctx.memberDocument);
      const preexistingCorp = await CorporationModel.findOne({
        guild: ctx.guildDocument,
        industry,
      });
      const ownerCorp = await CorporationModel.findOne({
        guild: ctx.guildDocument,
        owner: ctx.memberDocument,
      });

      if (ownerCorp)
        return await ctx.embedify(
          "error",
          "user",
          `You already own a corporation: ${ownerCorp.name}`,
          true
        );
      else if (!IndustryArr.includes(industry))
        return await ctx.embedify(
          "error",
          "user",
          `\`${industry}\` is not a valid industry.`,
          true
        );
      else if (preexistingCorp)
        return await ctx.embedify(
          "error",
          "user",
          `A corporation has already capitalized this industry: ${preexistingCorp.name}`,
          true
        );
      else if (balance > wallet)
        return await ctx.embedify(
          "error",
          "user",
          `You cannot afford a starting balance of ${balance.toLocaleString()}`,
          true
        );

      const corporation = await CorporationModel.create({
        guild: ctx.guildDocument,
        owner: ctx.memberDocument,
        name,
        industry,
        description,
        balance,
      });

      return await this.displayCorporation(ctx, corporation);
    } else if (subcommandGroup === "manage") {
    }

    return await ctx.embedify("info", "user", "test", true);
  };

  private async displayCorporation(
    ctx: Context,
    corporation: Corporation
  ): Promise<void> {
    const embed = ctx
      .embedify(
        "success",
        {
          name: `${
            corporation.name
          }, est. ${corporation.createdAt.toLocaleString()}`,
        },
        corporation.description
      )
      .addField("Industry", `\`${corporation.industry}\``, true)
      .addField(
        "Balance",
        `${ctx.guildDocument.currency}${corporation.balance.toLocaleString()}`,
        true
      )
      .setFooter({ text: `${corporation._id}` });
    return await ctx.interaction.reply({ embeds: [embed] });
  }
}
