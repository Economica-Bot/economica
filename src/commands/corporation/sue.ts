import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
  public data = new EconomicaSlashCommandBuilder()
    .setName('sue')
    .setDescription('Sue a rival corporation.')
    .setModule('CORPORATION');

  public async execute(ctx: Context): Promise<void> {
    return ctx.embedify('info', 'user', 'test', true);
  }
}
