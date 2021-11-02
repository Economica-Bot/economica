module.exports = {
  name: 'pay',
  group: 'economy',
  description: 'Pay server currency to other users.',
  global: true,
  format: '<user> <amount | all>',
  options: [
    {
      name: 'user',
      description: 'Specify a user.',
      type: 'USER',
      required: true,
  ***REMOVED***
    {
      name: 'amount',
      description: 'Specify an amount to pay.',
      type: 'STRING',
      required: true,
  ***REMOVED***
  ],
  async run(interaction) {
    let color = 'GREEN',
      description = '',
      embed,
      ephemeral = false;

    const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
    const { wallet } = await util.getEconInfo(
      interaction.guild.id,
      interaction.member.id
    );
    const targetMember = interaction.options.getMember('user');
    const amount =
      interaction.options.getString('amount') === 'all'
        ? wallet
        : parseInt(interaction.options.getString('amount'));

    if (targetMember.user.id === interaction.member.id) {
      embed = util.embedify(
        'RED',
        interaction.member.user.tag,
        interaction.member.user.displayAvatarURL(),
        'You cannot pay yourself!'
      );

      ephemeral = true;
    } else if (amount) {
      if (amount < 1 || amount > wallet) {
        color = 'RED';
        description = `Insufficient wallet: ${cSymbol}${amount.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
      } else {
        description = `Payed <@!${
          targetMember.id
        }> ${cSymbol}${amount.toLocaleString()}`;
        await util.transaction(
          interaction.guild.id,
          interaction.user.id,
          this.name,
          `Payment to  <@!${targetMember.user.id}>`,
          -amount,
          0,
          -amount
        );
        await util.transaction(
          interaction.guild.id,
          targetMember.user.id,
          this.name,
          `Payment from  <@!${interaction.member.id}>`,
          amount,
          0,
          amount
        );
      }
    } else {
      color = 'RED';
      description = `Invalid amount: \`${amount}\`\nFormat: \`${this.name} ${this.format}\``;
      ephemeral = true;
    }

    embed = util.embedify(
      color,
      interaction.member.user.tag,
      interaction.member.user.displayAvatarURL(),
      description
    );

    await interaction.reply({ embeds: [embed], ephemeral });
***REMOVED***
};
