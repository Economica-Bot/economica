module.exports = {
  name: 'dice',
  description: 'Roll a dice to and win some cash.',
  group: 'casino',
  global: true,
  options: [
    {
      name: 'bet',
      description: 'Specify a bet.',
      type: 'INTEGER',
      required: true,
  ***REMOVED***
    {
      name: 'number',
      description: 'Choose a number.',
      type: 'INTEGER',
      required: true,
  ***REMOVED***
  ],
  async run(interaction) {
    let color = 'GREEN',
      title = interaction.member.user.tag,
      icon_url = interaction.member.user.displayAvatarURL(),
      description = '';
    let bet = interaction.options.getInteger('bet');
    const number = interaction.options.getInteger('number');
    const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
    const { wallet } = await util.getEconInfo(
      interaction.guild.id,
      interaction.member.id
    );
    if (number < 0 || number > 6) {
      color = 'RED';
      description = `Invalid value: \`${number.toLocaleString()}\``;
    } else if (bet < 0 || bet > wallet) {
      color = 'RED';
      description = `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}`;
    } else {
      const diceRoll = Math.floor(Math.random() * 6 + 1);
      description += `The dice landed on \`${diceRoll}\`\n`;
      if (number === diceRoll) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        (color = 'RED'),
          (description += `You lost ${cSymbol}${bet.toLocaleString()}`);
        bet *= -1;
      }

      await util.transaction(
        interaction.guild.id,
        interaction.member.id,
        this.name,
        description,
        bet,
        0,
        bet
      );
    }

    await interaction.reply({
      embeds: [util.embedify(color, title, icon_url, description)],
    });
***REMOVED***
};
