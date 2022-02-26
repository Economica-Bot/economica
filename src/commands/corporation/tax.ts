import { Message } from "discord.js";
import {
  Context,
  Command,
  EconomicaSlashCommandBuilder,
} from "../../structures";

export default class implements Command {
  public data = new EconomicaSlashCommandBuilder()
    .setName("tax")
    .setDescription("Fill out taxes to avoid fines.")
    .setModule("CORPORATION")
    .addSubcommand((subcommand) =>
      subcommand.setName("view").setDescription("View your tax receipts.")
    );

  public execute = async (ctx: Context): Promise<void | Message<boolean>> => {
    return await ctx.embedify("info", "user", "test", true);
  };
}
