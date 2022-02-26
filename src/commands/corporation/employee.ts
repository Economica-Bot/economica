import { Message } from "discord.js";
import {
  Context,
  Command,
  EconomicaSlashCommandBuilder,
} from "../../structures";

export default class implements Command {
  public data = new EconomicaSlashCommandBuilder()
    .setName("employee")
    .setDescription("Manage employee-related things.")
    .setModule("CORPORATION")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clock_in")
        .setDescription("Earn some funds from your corporation.")
    );

  public execute = async (ctx: Context): Promise<void | Message> => {
    return await ctx.embedify("info", "user", "test", true);
  };
}
