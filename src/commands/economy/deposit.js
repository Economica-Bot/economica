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
      type: 3,
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, member, options) {
    let color = 'GREEN',
      description = '',
      embed;

    const cSymbol = await util.getCurrencySymbol(guild.id);
    const { wallet } = await util.getEconInfo(guild.id, member.user.id);
    const amount =
      options._hoistedOptions[0].value === 'all'
        ? wallet
        : parseInt(options._hoistedOptions[0].value);

    if (amount) { 
      if (amount < 1 || amount > wallet) {
        color = 'RED';
        description = `Insufficient wallet: ${cSymbol}${amount.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
      } else {
        description = `Deposited ${cSymbol}${amount.toLocaleString()}`;
        await util.transaction(
          guild.id,
          member.user.id,
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

    embed = util.embedify(
      color,
      member.user.username,
      member.user.displayAvatarURL(),
      description
    );

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
