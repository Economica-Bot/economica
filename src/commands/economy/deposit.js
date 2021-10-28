module.exports = {
  name: 'deposit',
  group: 'economy',
  description: 'Deposit funds from your wallet to the treasury.',
  format: '<amount | all>',
  global: true,
  options: [
    {
      name: 'amount',
      description: 'Specify the amount you wish to deposit.',
      type: 'STRING',
      required: true,
  ***REMOVED***
  ],
  async run(interaction) {
    let color = 'GREEN',
      description = '';
    const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
    const { wallet } = await util.getEconInfo(
      interaction.guild.id,
      interaction.member.id
    );
    const amount =
      interaction.options.getString('amount') === 'all'
        ? wallet
        : parseInt(interaction.options.getString('amount'));

    if (amount) {
      if (amount < 1 || amount > wallet) {
        color = 'RED';
        description = `Insufficient wallet: ${cSymbol}${amount.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
      } else {
        description = `Deposited ${cSymbol}${amount.toLocaleString()}`;
        await util.transaction(
          interaction.guild.id,
          interaction.member.user.id,
          this.name,
          '`system`',
          -amount,
          amount,
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
          interaction.member.user.username,
          interaction.member.user.displayAvatarURL(),
          description
        ),
      ],
    });
***REMOVED***
};
