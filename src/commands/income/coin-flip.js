module.exports = {
  name: 'coinflip',
  group: 'income',
  description: 'Double the money in your wallet by flipping a coin.',
  global: true,
  format: '<amount | all>',
  options: [
    {
      name: 'amount',
      description: 'Specify the amount you wish to withdraw.',
      type: 3,
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const properties = await util.getCommandStats(guild.id, this.name);
    const { wallet } = await util.getEconInfo(guild.id, author.id);
    let color = 'RED',
      description = '',
      embed;
    let amount =
      options._hoistedOptions[0].value === 'all'
        ? wallet
        : parseInt(options._hoistedOptions[0].value);
    const cSymbol = await util.getCurrencySymbol(guild.id);
    if (wallet < 1 || wallet < amount) {
      description = `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}`;
    } else if ( amount < 1) {
      description = `Invalid amount, must be above 0.`
    } else {
      if (!util.isSuccess(properties)) {
        description = `You flipped a coin and lost ${cSymbol}${amount.toLocaleString()}`;
        amount = -amount;
      } else {
        color = 'GREEN';
        description = `You flipped a coin and earned ${cSymbol}${amount.toLocaleString()}`;
      }

      util.transaction(
        guild.id,
        author.id,
        this.name,
        '`system`',
        amount,
        0,
        amount
      );
    }

    embed = util.embedify(
      color,
      author.user.username,
      author.user.displayAvatarURL(),
      description
    );

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
