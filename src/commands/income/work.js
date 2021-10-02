module.exports = {
  name: 'work',
  group: 'income',
  description: 'Earn wallet money',
  global: true,
  options: null,
  async run(interaction, guild, author) {
    const guildID = guild.id,
      userID = author.id;
    const { min, max } = await util.getIncomeCommandStats(guildID, this.name);

    const currencySymbol = await util.getCurrencySymbol(guildID);
    const amount = util.intInRange(min, max);
    const embed = util.embedify(
      'GREEN',
      author.user.username,
      author.user.displayAvatarURL(),
      `You worked and earned ${currencySymbol}${amount.toLocaleString()}!`
    );

    await interaction.reply({ embeds: [embed] });

    await util.transaction(
      guildID,
      userID,
      this.name,
      '`system`',
      amount,
      0,
      amount
    );
***REMOVED***
};
