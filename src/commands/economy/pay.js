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
      type: 6,
      required: true,
  ***REMOVED***
    {
      name: 'amount',
      description: 'Specify an amount to pay.',
      type: 3,
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    let color = 'GREEN',
      description = '',
      embed,
      ephemeral = false;

    const cSymbol = await util.getCurrencySymbol(guild.id);
    const { wallet } = await util.getEconInfo(guild.id, author.user.id);
    const member = options._hoistedOptions[0].member;
    const amount =
      options._hoistedOptions[1].value === 'all'
        ? wallet
        : parseInt(options._hoistedOptions[1].value);

    if (member.user.id === author.user.id) {
      embed = util.embedify(
        'RED',
        author.user.username,
        author.user.displayAvatarURL(),
        'You cannot pay yourself!'
      );

      ephemeral = true;
    } else if (amount) {
      if (amount < 1 || amount > wallet) {
        color = 'RED';
        description = `Insufficient wallet: ${cSymbol}${amount.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
      } else {
        description = `Payed <@!${
          member.user.id
        }> ${cSymbol}${amount.toLocaleString()}`;
        await util.transaction(
          guild.id,
          author.user.id,
          this.name,
          `Payment to  <@!${member.user.id}>`,
          -amount,
          0,
          -amount
        );
        await util.transaction(
          guild.id,
          member.user.id,
          this.name,
          `Payment from  <@!${author.user.id}>`,
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
      author.user.username,
      author.user.displayAvatarURL(),
      description
    );

    interaction.reply({ embeds: [embed], ephemeral });
***REMOVED***
};
