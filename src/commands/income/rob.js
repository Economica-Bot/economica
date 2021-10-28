module.exports = {
  name: 'rob',
  group: 'income',
  description: "Rob users. Steal up to the entire target's wallet",
  global: true,
  format: '<user>',
  options: [
    {
      name: 'user',
      description: 'Name a user you wish to see the balance of.',
      type: 'USER',
      required: true,
  ***REMOVED***
  ],
  async run(interaction) {
    const user = interaction.options.getUser('user');
    const guildID = interaction.guild.id;
    const userID = interaction.member.id;
    const properties = await util.getIncomeCommandStats(guildID, this.name);
    let color, description, amount;
    const { minfine, maxfine } = properties;
    const { wallet } = await util.getEconInfo(guildID, user.id);
    const cSymbol = await util.getCurrencySymbol(guildID);
    if (wallet < 1) {
      (color = 'RED'),
        (description = `<@!${user.id}>\nInsufficient wallet: ${cSymbol}${wallet}`);
    } else {
      if (util.isSuccess(properties)) {
        amount = util.intInRange(0, wallet);
        (color = 'GREEN'),
          (description = `You robbed <@!${
            user.id
          }> for a grand total of ${cSymbol}${amount.toLocaleString()}!`);
        await util.transaction(
          guildID,
          user.id,
          this.name,
          `Robbed by <@!${interaction.member.id}>`,
          -amount,
          0,
          -amount
        );
      } else {
        amount = util.intInRange(minfine, maxfine);
        color = 'RED';
        description = `You were caught robbing and fined ${cSymbol}${amount.toLocaleString()}`;
        amount *= -1;
      }

      await util.transaction(
        guildID,
        userID,
        this.name,
        `Attempted to rob <@!${user.id}>`,
        amount,
        0,
        amount
      );
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
