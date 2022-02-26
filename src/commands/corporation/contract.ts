import { validateObjectId, validateSubdocumentObjectId } from "../../lib";
import { Member } from "../../models";
import {
  Context,
  Command,
  EconomicaSlashCommandBuilder,
} from "../../structures";
import employee from "./employee";

export default class implements Command {
  public data = new EconomicaSlashCommandBuilder()
    .setName("contract")
    .setDescription("View, create, and edit employee contracts")
    .setModule("CORPORATION")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View contracts")
        .addStringOption((option) =>
          option.setName("employee").setDescription("Specify an employee")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a contract")
        .addStringOption((option) =>
          option
            .setName("employee")
            .setDescription("Specify an employee")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("salary")
            .setDescription("Specify a salary")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("edit").setDescription("Edit a contract")
    );

  public execute = async (ctx: Context): Promise<void> => {
    const subcommand = ctx.interaction.options.getSubcommand();
    const { valid: valid1, document: corporationDocument } =
      await validateObjectId(ctx, "Corporation");
    const { valid: valid2, document: employeeDocument } =
      await validateSubdocumentObjectId(ctx, "Employee", corporationDocument);
    if (!valid1 || !valid2) {
      return;
    } else if (subcommand === "view") {
      const { member }: { member: Member } = await employeeDocument
        .populate("member")
        .execPopulate();
      const description: string = employeeDocument.contracts
        .map((contract) => `Contract \`${contract._id}\``)
        .join("\n");
      return await ctx.embedify(
        "info",
        { name: `<@!${member.id}>'s Contracts` },
        description,
        true
      );
    } else if (subcommand === "create") {
      const { member }: { member: Member } = await employeeDocument
        .populate("member")
        .execPopulate();
      employeeDocument.contracts.push();
    }
  };
}
