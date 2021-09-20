module.exports = {
  name: 'withdraw',
  group: 'economy',
  description: 'Withdraw funds from the treasury to your wallet.',
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
    let color = 'GREEN',
      description = '',
      embed;

    const cSymbol = await util.getCurrencySymbol(guild.id);
    const { treasury } = await util.getEconInfo(guild.id, author.user.id);
    const amount =
      options._hoistedOptions[0].value === 'all'
        ? treasury
        : parseInt(options._hoistedOptions[0].value);
    
    if (amount || amount === 0) {
      if (amount < 1 || amount > treasury) {
        color = 'RED';
        description = `Insufficient treasury: ${cSymbol}${amount.toLocaleString()}\nCurrent treasury: ${cSymbol}${treasury.toLocaleString()}`;
      } else {
        description = `Withdrew ${cSymbol}${amount.toLocaleString()}`;
        await util.transaction(
          guild.id,
          author.user.id,
          this.name,
          '`system`',
          amount,
          -amount,
          0
        );
      }
    } else {
      color = 'RED';
      description = `Invalid amount: \`${amount}\`\nFormat: \`${this.name} ${this.format}\``;
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
