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
      type: 'STRING',
      required: true,
  ***REMOVED***
  ],
  async run(interaction) {
    let color = 'GREEN',
      description = '';

    const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
    const { treasury } = await util.getEconInfo(
      interaction.guild.id,
      interaction.member.id
    );
    const amount =
      interaction.options.getString('amount') === 'all'
        ? treasury
        : parseInt(interaction.options.getString('amount'));

    if (amount || amount === 0) {
      if (amount < 1 || amount > treasury) {
        color = 'RED';
        description = `Insufficient treasury: ${cSymbol}${amount.toLocaleString()}\nCurrent treasury: ${cSymbol}${treasury.toLocaleString()}`;
      } else {
        description = `Withdrew ${cSymbol}${amount.toLocaleString()}`;
        await util.transaction(
          interaction.guild.id,
          interaction.member.id,
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

    await interaction.reply({
      embeds: [
        util.embedify(
          color,
          interaction.user.username,
          interaction.member.user.displayAvatarURL(),
          description
        ),
      ],
    });
***REMOVED***
};
