module.exports = {
  name: 'crime',
  group: 'income',
  description:
    'Commit a crime to increase your wallet balance with risk of fine.',
  global: true,
  options: null,
  async run(interaction) {
    const guildID = interaction.guild.id,
      userID = interaction.member.id;
    const properties = await util.getIncomeCommandStats(guildID, this.name);

    let color, description, amount;
    const { min, max, minfine, maxfine } = properties;
    const cSymbol = await util.getCurrencySymbol(guildID);
    if (!util.isSuccess(properties)) {
      amount = util.intInRange(minfine, maxfine);
      color = 'RED';
      description = `You were caught commiting a crime and fined ${cSymbol}${amount.toLocaleString()}`;
      amount *= -1;
    } else {
      amount = util.intInRange(min, max);
      color = 'GREEN';
      description = `You commited a crime and earned ${cSymbol}${amount.toLocaleString()}!`;
    }

    await util.transaction(
      guildID,
      userID,
      this.name,
      '`system`',
      amount,
      0,
      amount
    );

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
